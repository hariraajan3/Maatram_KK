import prisma from '../config/prisma.js';
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
      prisma.tutor.count({ where: { status: 'active' } }),
      prisma.student.count({ where: { isActive: true } }),
      prisma.class.count(),
      prisma.class.count({
        where: {
          startTime: { gt: new Date() },
          status: 'scheduled'
        }
      }),
      prisma.attendance.aggregate({
        _count: { id: true },
        _sum: { present: true }
      }),
      prisma.class.groupBy({
        by: ['phase'],
        _count: { id: true }
      }),
      prisma.onboardingRequest.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          requester: {
            select: { name: true }
          }
        }
      }),
      prisma.swapRequest.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          proposedByTutor: {
            include: {
              user: { select: { name: true } }
            }
          },
          class: {
            select: { subject: true, startTime: true }
          }
        }
      }),
      prisma.student.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const attendanceRate = attendanceStats._count.id > 0
      ? Math.round((attendanceStats._sum.present / attendanceStats._count.id) * 100)
      : 0;

    res.json({
      meta: {
        totalTutors,
        totalStudents,
        totalClasses,
        upcomingClasses,
        attendanceRate,
      },
      workloadByPhase: workloadByPhase.reduce((acc, item) => {
        acc[item.phase] = item._count.id;
        return acc;
      }, {}),
      onboardingQueue: onboardingQueue.map(req => ({
        id: req.id,
        name: req.name,
        email: req.email,
        requestedBy: req.requester?.name,
        createdAt: req.createdAt
      })),
      swapQueue: swapQueue.map(req => ({
        id: req.id,
        tutorName: req.proposedByTutor.user.name,
        subject: req.class.subject,
        startTime: req.class.startTime,
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

