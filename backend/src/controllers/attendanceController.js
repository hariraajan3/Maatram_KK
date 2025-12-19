import { v4 as uuid } from 'uuid';
import validator from 'express-validator';
import prisma from '../config/prisma.js';

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
    const record = await prisma.attendance.create({
      data: {
        classId,
        studentId,
        present,
        absentReason,
        marks: marks ? parseFloat(marks) : null,
        notes,
        recordedBy: req.user.id,
        date: new Date(),
      },
      include: {
        student: true,
        class: {
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
      where: { status: 'active' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        classes: {
          where: {
            status: { in: ['scheduled', 'completed'] }
          },
          include: {
            attendance: {
              include: {
                student: true
              }
            },
            _count: {
              select: {
                attendance: true
              }
            }
          },
          orderBy: { startTime: 'desc' },
          take: 5 // Last 5 classes
        },
        _count: {
          select: {
            studentAssignments: true
          }
        }
      },
      orderBy: { avgAttendance: 'desc' }
    });

    const overview = tutors.map(tutor => {
      const totalClasses = tutor.classes.length;
      const totalAttendance = tutor.classes.reduce((sum, cls) => sum + cls._count.attendance, 0);
      const avgAttendance = totalClasses > 0 ? (totalAttendance / totalClasses) * 100 : 0;

      return {
        tutorId: tutor.id,
        tutorName: tutor.user.name,
        email: tutor.user.email,
        medium: tutor.medium,
        district: tutor.district,
        subjects: tutor.subjects,
        studentCount: tutor._count.studentAssignments,
        avgAttendance: Math.round(avgAttendance * 100) / 100,
        recentClasses: tutor.classes.map(cls => ({
          id: cls.id,
          subject: cls.subject,
          startTime: cls.startTime,
          status: cls.status,
          attendanceCount: cls._count.attendance,
          studentCount: cls.attendance.length
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

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        tutor: {
          include: {
            user: true
          }
        },
        attendance: {
          include: {
            student: true,
            recorder: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { student: { name: 'asc' } }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get all students in the class group
    const students = await prisma.student.findMany({
      where: {
        group: classData.studentGroup,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    const attendanceMap = new Map(
      classData.attendance.map(att => [att.studentId, att])
    );

    const attendanceDetails = students.map(student => {
      const attendance = attendanceMap.get(student.id);
      return {
        studentId: student.id,
        studentName: student.name,
        present: attendance ? attendance.present : null,
        absentReason: attendance ? attendance.absentReason : null,
        marks: attendance ? attendance.marks : null,
        notes: attendance ? attendance.notes : null,
        recordedBy: attendance ? attendance.recorder?.name : null,
        recordedAt: attendance ? attendance.createdAt : null
      };
    });

    res.json({
      class: {
        id: classData.id,
        subject: classData.subject,
        startTime: classData.startTime,
        endTime: classData.endTime,
        status: classData.status,
        tutorName: classData.tutor?.user.name,
        studentGroup: classData.studentGroup
      },
      attendance: attendanceDetails,
      summary: {
        totalStudents: students.length,
        presentCount: classData.attendance.filter(att => att.present).length,
        absentCount: classData.attendance.filter(att => !att.present).length,
        unmarkedCount: students.length - classData.attendance.length
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
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (date) where.date = new Date(date);

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: true,
        class: {
          include: {
            tutor: {
              include: {
                user: true
              }
            }
          }
        },
        recorder: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.attendance.count({ where });

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

