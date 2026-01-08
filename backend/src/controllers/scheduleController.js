import prisma from '../../lib/prisma.js';
import { sendNotificationBundle } from '../utils/notifications.js';
import { decrypt } from '../utils/security.js';

const listClasses = async (_req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        tutor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        scheduleDate: 'asc'
      }
    });

    const classes = schedules.map((s) => ({
      id: s.id,
      classId: s.classId || `CLS-${s.id}`,
      scheduleDate: s.scheduleDate,
      scheduleAt: s.scheduleAt,
      subject: s.subject,
      medium: s.medium,
      district: s.district,
      tutorId: s.tutorId,
      tutorName: s.tutor?.user?.name || 'Unassigned',
      status: s.status,
      meetLink: s.meetLink,
    }));

    res.json({ classes });
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { schedules } = req.body; // Expecting an array of schedules for the week

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: 'Schedules array is required' });
    }

    // Process each schedule to find fallback meet links from tutor profile
    const enrichedSchedules = await Promise.all(schedules.map(async (s) => {
      let finalMeetLink = s.meetLink;

      if (!finalMeetLink || finalMeetLink.trim() === '') {
        const tutor = await prisma.tutor.findUnique({
          where: { id: parseInt(s.tutorId) },
          select: { meetLink: true }
        });
        finalMeetLink = tutor?.meetLink || '';
      }

      return { ...s, meetLink: finalMeetLink };
    }));

    const createdSchedules = await prisma.$transaction(
      enrichedSchedules.map((s) =>
        prisma.schedule.create({
          data: {
            classId: s.classId,
            scheduleDate: new Date(s.scheduleDate),
            scheduleAt: new Date(s.scheduleAt),
            subject: s.subject,
            medium: s.medium,
            district: s.district,
            tutorId: parseInt(s.tutorId),
            meetLink: s.meetLink,
            status: 'SCHEDULED',
          },
        })
      )
    );

    res.status(201).json({ classes: createdSchedules });
  } catch (error) {
    next(error);
  }
};

const createSwapRequest = async (req, res, next) => {
  try {
    const { classId, reason, proposedByTutorId, targetTutorId, desiredDate } = req.body;

    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(classId) }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const request = await prisma.classSwapRequest.create({
      data: {
        schedulingId: parseInt(classId),
        requestedByTutorId: parseInt(proposedByTutorId),
        requestedToTutorId: parseInt(targetTutorId),
        reason,
        status: 'PENDING',
      },
    });

    const targetTutor = await prisma.tutor.findUnique({
      where: { id: parseInt(targetTutorId) },
      include: { user: true }
    });

    if (targetTutor && targetTutor.user.email) {
      await sendNotificationBundle({
        toEmail: targetTutor.user.email,
        toPhone: targetTutor.phoneNumber,
        subject: 'Class swap request pending',
        html: `<p>A swap was requested for a class on ${new Date(
          schedule.scheduleAt,
        ).toLocaleString('en-IN')}.</p>`,
        whatsappMessage: `Swap request pending for class on ${new Date(schedule.scheduleAt).toLocaleDateString()}.`,
      });
    }

    res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
};

const updateSwapRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.classSwapRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        schedule: true
      }
    });

    // Notify proposer
    const proposer = await prisma.tutor.findUnique({
      where: { id: request.requestedByTutorId },
      include: { user: true }
    });

    if (proposer && proposer.user.email) {
      await sendNotificationBundle({
        toEmail: proposer.user.email,
        toPhone: proposer.phoneNumber,
        subject: `Swap ${status}`,
        html: `<p>Your swap request for class on ${new Date(request.schedule.scheduleAt).toLocaleDateString()} is now <strong>${status}</strong>.</p>`,
        whatsappMessage: `Swap request ${status}.`,
      });
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

export { listClasses, createClass, createSwapRequest, updateSwapRequest };


