import prisma from '../../lib/prisma.js';
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
                        schedules: true, // properties from schema: schedules, attendances
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get actual student counts and attendance
        const tutorsWithCounts = await Promise.all(
            tutors.map(async (tutor) => {
                // Calculate average attendance from schedules
                const schedules = await prisma.schedule.findMany({
                    where: { tutorId: tutor.id },
                    include: {
                        attendances: true,
                        _count: {
                            select: { attendances: true }
                        }
                    }
                });

                let totalAttendance = 0;
                let totalClasses = 0;
                schedules.forEach(sch => {
                    if (sch._count.attendances > 0) {
                        const presentCount = sch.attendances.filter(att => att.attendanceStatus === 'PRESENT').length;
                        totalAttendance += (presentCount / sch._count.attendances) * 100;
                        totalClasses++;
                    }
                });
                const avgAttendance = totalClasses > 0 ? totalAttendance / totalClasses : 0;

                return {
                    id: tutor.id,
                    name: tutor.user.name,
                    email: tutor.user.email,
                    medium: tutor.tutoringMedium, // schema: tutoringMedium
                    district: tutor.tutoringDistrict, // schema: tutoringDistrict
                    subject: (tutor.tutoringSubjects || [])[0] || 'Unassigned', // Enforce single subject display
                    subjects: tutor.tutoringSubjects || [], // Keep for compatibility
                    status: tutor.onboardingStatus, // schema: onboardingStatus
                    scheduleCount: tutor._count.schedules,
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
        const { name, email, phone, medium, district, subject, subjects } = req.body;

        // Start Enforce Single Subject Rule
        // If 'subject' string provided, use it. If 'subjects' array provided, take the first one.
        const primarySubject = subject || (Array.isArray(subjects) && subjects.length > 0 ? subjects[0] : null);
        // End Enforce Single Subject Rule

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
                    password: passwordHash,
                    role: 'TUTOR', // Enum: TUTOR
                },
            });
        }

        // Create tutor profile
        const tutor = await prisma.tutor.create({
            data: {
                userId: user.id,
                kkId: `TUT${Date.now()}`, // Dummy KKID generation
                phoneNumber: phone, // schema: phoneNumber
                tutoringMedium: medium || 'English', // schema: tutoringMedium, Enum
                tutoringDistrict: district || 'Chennai', // schema: tutoringDistrict, Enum
                tutoringSubjects: primarySubject ? [primarySubject] : [], // Store as single-valued array
                onboardingStatus: 'approved', // schema: onboardingStatus
                tutorAddress: '',
                collegeOrCompany: '',
                alumniOrYearStudying: '',
                tutoringExperienceYears: 0,
            },
        });

        logAction(req.user || { id: 0 }, 'CREATE_TUTOR', `Created tutor ${name} (${email}) - ${primarySubject}`, 'Tutor', tutor.id);

        res.status(201).json({
            tutor: {
                id: tutor.id,
                name: user.name,
                email: user.email,
                medium: tutor.tutoringMedium,
                district: tutor.tutoringDistrict,
                subject: primarySubject,
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
        const { month, year } = req.query;

        const tutor = await prisma.tutor.findUnique({
            where: { id: tutorId },
        });

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }

        // Date filter
        let dateFilter = {};
        if (month && year) {
            const startDate = new Date(Date.UTC(year, month - 1, 1));
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
            dateFilter = {
                startTime: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        // Get attendance records for classes taught by this tutor
        const classes = await prisma.class.findMany({
            where: {
                tutorId,
                ...dateFilter
            },
            include: {
                attendance: {
                    include: {
                        student: {
                            select: { id: true, name: true }
                        }
                    }
                },
            },
            orderBy: { startTime: 'asc' },
        });

        // 1. Daily Summary (History)
        const dateMap = {};
        const studentMap = new Map();
        const records = {};

        classes.forEach((cls) => {
            const dateKey = cls.startTime.toISOString().split('T')[0];

            // Initialize daily summary
            if (!dateMap[dateKey]) {
                dateMap[dateKey] = { present: 0, absent: 0, total: 0 };
            }
            dateMap[dateKey].total += cls.attendance.length; // Or use enrolled count if available

            cls.attendance.forEach((att) => {
                // Update daily summary
                if (att.present) {
                    dateMap[dateKey].present += 1;
                } else {
                    dateMap[dateKey].absent += 1;
                }

                // Collect student info
                if (!studentMap.has(att.studentId)) {
                    studentMap.set(att.studentId, {
                        id: att.studentId,
                        name: att.student.name
                    });
                }

                // Build detailed record
                if (!records[att.studentId]) {
                    records[att.studentId] = {};
                }
                records[att.studentId][dateKey] = {
                    status: att.present ? 'P' : 'A',
                    notes: att.notes || (att.absentReason),
                    marks: att.marks
                };
            });
        });

        const history = Object.entries(dateMap)
            .map(([date, counts]) => ({ date, ...counts }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const detailed = {
            dates: classes.map(c => ({
                date: c.startTime.toISOString().split('T')[0],
                classId: c.id
            })), // unique dates
            students: Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
            records
        };

        // Filter unique dates in detailed.dates just in case multiple classes per day
        const uniqueDates = [];
        const seenDates = new Set();
        detailed.dates.forEach(d => {
            if (!seenDates.has(d.date)) {
                seenDates.add(d.date);
                uniqueDates.push(d);
            }
        });
        detailed.dates = uniqueDates;

        res.json({ history, detailed });
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
