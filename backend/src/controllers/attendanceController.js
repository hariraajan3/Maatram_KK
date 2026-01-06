import { v4 as uuid } from 'uuid';
import validator from 'express-validator';
import prisma from '../../lib/prisma.js';

const { validationResult } = validator;

const recordAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation failed');
      err.status = 422;
      err.details = errors.array();
      throw err;
    }

    const { classId, studentId, present, notes, absentReason, marks } = req.body;
    const record = await prisma.studentAttendance.create({
      data: {
        schedulingId: parseInt(classId),
        studentId: parseInt(studentId),
        attendanceStatus: present ? 'PRESENT' : 'ABSENT',
        remarks: notes || absentReason,
        totalStudents: marks ? parseInt(marks) : null, // Reinterpreting marks for now to avoid crash
        classDate: new Date(),
        tutorId: req.user.id, // Assuming the recorder is the tutor for now
      },
      include: {
        student: true,
        schedule: {
          include: {
            tutor: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    res.status(201).json({ record });
  } catch (error) {
    next(error);
  }
};

const getTutorAttendanceOverview = async (req, res, next) => {
  try {
    const tutors = await prisma.tutor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        },
        schedules: {
          where: {
            status: { in: ['SCHEDULED', 'COMPLETED'] }
          },
          include: {
            attendances: {
              select: { studentId: true }
            },
            _count: {
              select: {
                attendances: true
              }
            }
          },
          orderBy: { scheduleAt: 'desc' },
          take: 5 // Last 5 classes
        }
      }
    });

    const overview = tutors.map(tutor => {
      // Calculate active student count based on unique students in recent schedules
      const uniqueStudents = new Set();
      tutor.schedules.forEach(schedule => {
        schedule.attendances.forEach(att => uniqueStudents.add(att.studentId));
      });

      const avgAttendance = 0;

      return {
        tutorId: tutor.id,
        tutorName: tutor.user.name,
        email: tutor.user.email,
        medium: tutor.tutoringMedium,
        district: tutor.tutoringDistrict,
        subjects: tutor.tutoringSubjects,
        isActive: tutor.user.isActive,
        studentCount: uniqueStudents.size,
        avgAttendance: Math.round(avgAttendance * 100) / 100,
        recentClasses: tutor.schedules.map(sch => ({
          id: sch.id,
          subject: sch.subject,
          startTime: sch.scheduleAt,
          status: sch.status,
          attendanceCount: sch._count.attendances,
          studentCount: sch.attendances.length
        }))
      };
    });

    res.json({ overview });
  } catch (error) {
    next(error);
  }
};

const getClassAttendanceDetails = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classData = await prisma.schedule.findUnique({
      where: { id: parseInt(classId) },
      include: {
        tutor: {
          include: {
            user: true
          }
        },
        attendances: {
          include: {
            student: true
          },
          orderBy: { student: { name: 'asc' } }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all students matching the schedule's criteria
    const students = await prisma.student.findMany({
      where: {
        medium: classData.medium,
        district: classData.district,
      },
      orderBy: { name: 'asc' }
    });

    const attendanceMap = new Map(
      classData.attendances.map(att => [att.studentId, att])
    );

    const attendanceDetails = students.map(student => {
      const attendance = attendanceMap.get(student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        present: attendance ? (attendance.attendanceStatus === 'PRESENT') : null,
        absentReason: attendance ? attendance.remarks : null,
        notes: attendance ? attendance.remarks : null,
        recordedAt: attendance ? attendance.classDate : null
      };
    });

    res.json({
      class: {
        id: classData.id,
        subject: classData.subject,
        startTime: classData.scheduleAt,
        status: classData.status,
        tutorName: classData.tutor?.user.name,
      },
      attendance: attendanceDetails,
      summary: {
        totalStudents: students.length,
        presentCount: classData.attendances.filter(att => att.attendanceStatus === 'PRESENT').length,
        absentCount: classData.attendances.filter(att => att.attendanceStatus === 'ABSENT').length,
        unmarkedCount: students.length - classData.attendances.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const { classId, studentId, date, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (classId) where.schedulingId = parseInt(classId);
    if (studentId) where.studentId = parseInt(studentId);
    if (date) where.classDate = new Date(date);

    const attendance = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: true,
        schedule: {
          include: {
            tutor: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { classDate: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.studentAttendance.count({ where });

    res.json({
      attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  recordAttendance,
  listAttendance,
  getTutorAttendanceOverview,
  getClassAttendanceDetails
};

