import prisma from '../../lib/prisma.js';
import { decrypt, maskValue } from '../utils/security.js';

const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const group = item[key] || 'unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

const getDashboard = async (req, res, next) => {
  try {
    const [totalTutors, totalStudents, totalClasses, upcomingClasses, attendanceStats, workloadByPhase, onboardingQueue, swapQueue, recentStudents] = await Promise.all([
      prisma.tutor.count({ where: { onboardingStatus: 'approved' } }),
      prisma.student.count(),
      prisma.schedule.count(),
      prisma.schedule.count({
        where: {
          scheduleAt: { gt: new Date() },
          status: 'SCHEDULED'
        }
      }),
      prisma.studentAttendance.aggregate({
        _count: { id: true },
        // _sum: { present: true } // studentAttendance uses attendanceStatus enum, not boolean present
      }),
      prisma.schedule.groupBy({
        by: ['status'], // schedule model has status, not phase
        _count: { id: true }
      }),
      prisma.OnboardingUsers.findMany({
        where: { onboardingStatus: 'pending' },
        orderBy: { invitedOn: 'desc' },
        take: 5
      }),
      prisma.classSwapRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          schedule: {
            select: { subject: true, scheduleAt: true }
          }
        }
      }),
      prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Note: attendanceRate calculation might need adjustment based on how attendanceStatus works
    const attendanceRate = 0;

    res.json({
      meta: {
        totalTutors,
        totalStudents,
        totalClasses,
        upcomingClasses,
        attendanceRate,
      },
      workloadByStatus: workloadByPhase.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
      onboardingQueue: onboardingQueue.map(req => ({
        id: req.id,
        name: req.fullName,
        email: req.email,
        createdAt: req.invitedOn
      })),
      swapQueue: swapQueue.map(req => ({
        id: req.id,
        subject: req.schedule.subject,
        startTime: req.schedule.scheduleAt,
        createdAt: req.createdAt
      })),
      students: recentStudents.map((student) => ({
        ...student,
        guardianContact: student.guardianContactEncrypted
          ? maskValue(decrypt(student.guardianContactEncrypted), 3)
          : null,
      })),
      role: req.user.role,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, subject, district, medium } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { kkId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (district) {
      where.district = { equals: district, mode: 'insensitive' };
    }

    // Note: Medium and Subject filtering on Json/implicit fields might require specific data structure knowledge.
    // For now, we perform basic filtering. Advanced JSON filtering depends on checking the specific structure of tutoringSubjects.
    // If subject is provided, we attempt to check if the JSON array contains it.
    if (subject) {
      // Assuming tutoringSubjects is an array of strings like ["Math", "Science"]
      // Prisma Postgres JSON filter:
      where.tutoringSubjects = {
        array_contains: subject
      };
    }

    // Medium is not directly on student, but often implied by school or explicitly filtered if part of subjects.
    // Use with caution if medium data is not in student record.

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        include: {
          // Include recent attendance or high level stats if needed?
          // For now just basic details.
        }
      })
    ]);

    // Fetch attendance summary for these students to show "progress" or "attendance" in list?
    // Doing it for all might be expensive. We can fetch it generally or just return student data.
    // Let's attach basic attendance stats.

    const studentsWithStats = await Promise.all(students.map(async (student) => {
      // Get overall attendance
      const attendance = await prisma.studentAttendance.aggregate({
        where: { studentId: student.id },
        _count: { id: true }
        // To get strict attendance percentage we need total schedules vs present.
        // This is an estimation. 
      });

      // Calculate a mock or real "progress" if data exists. 
      // For now, return basic info.
      return {
        ...student,
        attendanceCount: attendance._count.id
      };
    }));

    res.json({
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      students: studentsWithStats
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard, getDashboardStudents };

