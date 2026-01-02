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
      prisma.tutorOnboarding.findMany({
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

export { getDashboard };

