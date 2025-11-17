const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const dataStore = require('../models/dataStore');
const { sendNotificationBundle } = require('../utils/notifications');
const { decrypt } = require('../utils/security');

const validate = (req) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = result.array();
    throw err;
  }
};

const listClasses = (_req, res) => {
  const classes = dataStore.classes.map((cls) => {
    const tutor = dataStore.tutors.find((t) => t.id === cls.tutorId);
    return {
      ...cls,
      tutorName: tutor?.name || 'Unassigned',
    };
  });
  res.json({ classes });
};

const createClass = (req, res, next) => {
  try {
    validate(req);
    const { phase, tutorId, studentGroup, startTime, modality } = req.body;
    const entry = {
      id: uuid(),
      phase,
      tutorId,
      studentGroup,
      startTime,
      endTime: req.body.endTime,
      status: 'scheduled',
      modality,
      createdBy: req.user.id,
    };
    dataStore.classes.push(entry);
    res.status(201).json({ class: entry });
  } catch (error) {
    next(error);
  }
};

const createSwapRequest = async (req, res, next) => {
  try {
    validate(req);
    const { classId, reason, proposedByTutorId, targetTutorId, desiredDate } = req.body;
    const targetClass = dataStore.classes.find((cls) => cls.id === classId);
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    const request = {
      id: uuid(),
      classId,
      reason,
      proposedByTutorId,
      targetTutorId,
      desiredDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dataStore.swapRequests.push(request);

    const targetTutor = dataStore.tutors.find((t) => t.id === targetTutorId);
    if (targetTutor) {
      await sendNotificationBundle({
        toEmail: targetTutor.email,
        toPhone: decrypt(targetTutor.phone),
        subject: 'Class swap request pending',
        html: `<p>A swap was requested for ${targetClass.studentGroup} on ${new Date(
          targetClass.startTime,
        ).toLocaleString('en-IN')}.</p>`,
        whatsappMessage: `Swap request pending for group ${targetClass.studentGroup}.`,
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
    const request = dataStore.swapRequests.find((item) => item.id === id);
    if (!request) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    request.status = status;
    request.updatedAt = new Date().toISOString();

    const proposer = dataStore.tutors.find((t) => t.id === request.proposedByTutorId);
    if (proposer) {
      await sendNotificationBundle({
        toEmail: proposer.email,
        toPhone: decrypt(proposer.phone),
        subject: `Swap ${status}`,
        html: `<p>Your swap request is now <strong>${status}</strong>.</p>`,
        whatsappMessage: `Swap request ${status}.`,
      });
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listClasses,
  createClass,
  createSwapRequest,
  updateSwapRequest,
};

