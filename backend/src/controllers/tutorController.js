import prisma from '../config/prisma.js';
import { encrypt } from '../utils/security.js';
import { logAction } from '../utils/auditLogger.js';

// List all tutors with student counts
const listTutors = async (req, res, next) => {
    try {
        const tutors = await prisma.tutor.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
                _count: {
                    select: {
                        studentAssignments: true,
                        classes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get actual student counts and attendance
        const tutorsWithCounts = await Promise.all(
            tutors.map(async (tutor) => {
                // Calculate average attendance from classes
                const classes = await prisma.class.findMany({
                    where: { tutorId: tutor.id },
                    include: {
                        attendance: true,
                        _count: {
                            select: { attendance: true }
                        }
                    }
                });

                let totalAttendance = 0;
                let totalClasses = 0;
                classes.forEach(cls => {
                    if (cls._count.attendance > 0) {
                        const presentCount = cls.attendance.filter(att => att.present).length;
                        totalAttendance += (presentCount / cls._count.attendance) * 100;
                        totalClasses++;
                    }
                });
                const avgAttendance = totalClasses > 0 ? totalAttendance / totalClasses : 0;

                return {
                    id: tutor.id,
                    name: tutor.user.name,
                    email: tutor.user.email,
                    medium: tutor.medium,
                    district: tutor.district,
                    subjects: tutor.subjects || [],
                    status: tutor.status,
                    studentCount: tutor._count.studentAssignments,
                    classCount: tutor._count.classes,
                    avgAttendance: Math.round(avgAttendance * 100) / 100,
                    createdAt: tutor.createdAt,
                };
            })
        );

        res.json({ tutors: tutorsWithCounts });
    } catch (error) {
        next(error);
    }
};

// Create a new tutor
const createTutor = async (req, res, next) => {
    try {
        const { name, email, phone, medium, district, subjects } = req.body;

        // Check if user already exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create user first (with default password)
            const bcrypt = await import('bcryptjs');
            const defaultPassword = 'Maatram@123';
            const passwordHash = await bcrypt.hash(defaultPassword, 12);

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role: 'tutor',
                },
            });
        }

        // Create tutor profile
        const tutor = await prisma.tutor.create({
            data: {
                userId: user.id,
                name,
                email,
                phoneEncrypted: phone ? encrypt(phone) : null,
                medium: medium || null,
                district: district || null,
                subjects: subjects || [],
                status: 'active',
            },
        });

        logAction(req.user, 'CREATE_TUTOR', `Created tutor ${name} (${email})`, 'Tutor', tutor.id);

        res.status(201).json({
            tutor: {
                id: tutor.id,
                name: tutor.name,
                email: tutor.email,
                medium: tutor.medium,
                district: tutor.district,
                subjects: tutor.subjects,
                status: tutor.status,
            },
            message: 'Tutor created successfully. Default password is Maatram@123',
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'A tutor with this email already exists' });
        }
        next(error);
    }
};

// Get students assigned to a specific tutor
const getTutorStudents = async (req, res, next) => {
    try {
        const { tutorId } = req.params;

        const tutor = await prisma.tutor.findUnique({
            where: { id: tutorId },
        });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Get students based on matching medium, district, and subjects
        // In production, you'd have a StudentTutorAssignment table
        const students = await prisma.student.findMany({
            where: {
                medium: tutor.medium,
                district: tutor.district,
                phase: { in: ['Selection', 'Scheduling', 'Attendance'] },
            },
            select: {
                id: true,
                name: true,
                medium: true,
                district: true,
                requestedSubjects: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });

        // Filter students whose subjects overlap with tutor's subjects
        const tutorSubjects = tutor.subjects || [];
        const matchedStudents = students.filter((student) => {
            const studentSubjects = student.requestedSubjects || [];
            return studentSubjects.some((subject) => tutorSubjects.includes(subject));
        }).map((student) => ({
            ...student,
            subjects: (student.requestedSubjects || []).filter((s) => tutorSubjects.includes(s)),
        }));

        res.json({ students: matchedStudents });
    } catch (error) {
        next(error);
    }
};

// Get attendance history for a specific tutor
const getTutorAttendanceHistory = async (req, res, next) => {
    try {
        const { tutorId } = req.params;

        const tutor = await prisma.tutor.findUnique({
            where: { id: tutorId },
        });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Get attendance records for classes taught by this tutor
        const classes = await prisma.class.findMany({
            where: { tutorId },
            include: {
                attendance: {
                    select: {
                        date: true,
                        present: true,
                    },
                },
            },
        });

        // Aggregate by date
        const dateMap = {};
        classes.forEach((cls) => {
            cls.attendance.forEach((att) => {
                const dateKey = att.date.toISOString().split('T')[0];
                if (!dateMap[dateKey]) {
                    dateMap[dateKey] = { present: 0, absent: 0, total: 0 };
                }
                dateMap[dateKey].total += 1;
                if (att.present) {
                    dateMap[dateKey].present += 1;
                } else {
                    dateMap[dateKey].absent += 1;
                }
            });
        });

        const history = Object.entries(dateMap)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ history });
    } catch (error) {
        next(error);
    }
};

// Get students assigned to the current logged-in tutor
const getMyStudents = async (req, res, next) => {
    try {
        const tutor = await prisma.tutor.findUnique({
            where: { userId: req.user.id },
        });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        // Use the same logic as getTutorStudents
        const students = await prisma.student.findMany({
            where: {
                medium: tutor.medium,
                district: tutor.district,
                phase: { in: ['Selection', 'Scheduling', 'Attendance'] },
            },
            select: {
                id: true,
                name: true,
                medium: true,
                district: true,
                requestedSubjects: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });

        // Filter students whose subjects overlap with tutor's subjects
        const tutorSubjects = tutor.subjects || [];
        const matchedStudents = students.filter((student) => {
            const studentSubjects = student.requestedSubjects || [];
            return studentSubjects.some((subject) => tutorSubjects.includes(subject));
        }).map((student) => ({
            ...student,
            subjects: (student.requestedSubjects || []).filter((s) => tutorSubjects.includes(s)),
        }));

        res.json({ students: matchedStudents });
    } catch (error) {
        next(error);
    }
};

// Record attendance for multiple students at once
const recordTutorAttendance = async (req, res, next) => {
    try {
        const { date, attendance } = req.body;
        // attendance = [{ studentId, present, absentReason, marks }]

        const tutor = await prisma.tutor.findUnique({
            where: { userId: req.user.id },
        });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found' });
        }

        // Get or create a class for today
        let cls = await prisma.class.findFirst({
            where: {
                tutorId: tutor.id,
                startTime: {
                    gte: new Date(date + 'T00:00:00Z'),
                    lt: new Date(date + 'T23:59:59Z'),
                },
            },
        });

        if (!cls) {
            cls = await prisma.class.create({
                data: {
                    phase: 'Attendance',
                    tutorId: tutor.id,
                    subject: (tutor.subjects || ['Maths'])[0],
                    studentGroup: `${tutor.medium}-${tutor.district}`,
                    startTime: new Date(date + 'T09:00:00Z'),
                    endTime: new Date(date + 'T10:00:00Z'),
                    status: 'completed',
                    modality: 'virtual',
                    createdBy: req.user.id,
                },
            });
        }

        // Record attendance for each student
        const results = await Promise.all(
            attendance.map(async (record) => {
                try {
                    const existing = await prisma.attendance.findFirst({
                        where: {
                            classId: cls.id,
                            studentId: record.studentId,
                            date: new Date(date),
                        },
                    });

                    const notes = record.present
                        ? (record.marks ? `Marks: ${record.marks}` : null)
                        : (record.absentReason || 'No reason provided');

                    if (existing) {
                        return await prisma.attendance.update({
                            where: { id: existing.id },
                            data: {
                                present: record.present,
                                notes,
                                recordedBy: req.user.id,
                            },
                        });
                    } else {
                        return await prisma.attendance.create({
                            data: {
                                classId: cls.id,
                                studentId: record.studentId,
                                present: record.present,
                                notes,
                                recordedBy: req.user.id,
                                date: new Date(date),
                            },
                        });
                    }
                } catch (err) {
                    console.error('Error recording attendance for student:', record.studentId, err);
                    return null;
                }
            })
        );

        logAction(req.user, 'RECORD_ATTENDANCE', `Recorded attendance for ${attendance.length} students on ${date}`);

        res.json({
            message: 'Attendance recorded successfully',
            recorded: results.filter(Boolean).length,
        });
    } catch (error) {
        next(error);
    }
};

export {
    listTutors,
    createTutor,
    getTutorStudents,
    getTutorAttendanceHistory,
    getMyStudents,
    recordTutorAttendance,
};
