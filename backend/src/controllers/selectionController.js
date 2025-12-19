import validator from 'express-validator';
import prisma from '../config/prisma.js';
import { encrypt } from '../utils/security.js';
import { sendNotificationBundle } from '../utils/notifications.js';
import { logAction } from '../utils/auditLogger.js';

const { validationResult } = validator;

const respondValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = errors.array();
    throw err;
  }
};

// Create a new student application (Phase 1)
const createApplication = async (req, res, next) => {
  try {
    respondValidation(req);
    const { name, email, phone, guardianContact, medium, district, requestedSubjects } = req.body;

    const application = await prisma.studentApplication.create({
      data: {
        name,
        email: email || null,
        phoneEncrypted: phone ? encrypt(phone) : null,
        guardianContactEncrypted: guardianContact ? encrypt(guardianContact) : null,
        medium: medium || null,
        district: district || null,
        requestedSubjects: requestedSubjects || [],
        phase: 'Phase1_Selection',
        createdBy: req.user.id,
      },
    });

    logAction(req.user, 'CREATE_APPLICATION', `Created student application for ${name}`, 'StudentApplication', application.id);

    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
};

// List all applications with optional phase filter
const listApplications = async (req, res, next) => {
  try {
    const { phase, medium, district } = req.query;
    const where = {};
    
    if (phase) where.phase = phase;
    if (medium) where.medium = medium;
    if (district) where.district = district;

    const applications = await prisma.studentApplication.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        phase1Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase2Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase3Reviewer: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, phase: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

// Get single application
const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.studentApplication.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        phase1Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase2Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase3Reviewer: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, phase: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    next(error);
  }
};

// Update application phase (Phase 1 -> Phase 2 -> Phase 3 -> Selected/Rejected)
const updateApplicationPhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phase, notes } = req.body;

    const application = await prisma.studentApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updateData = { phase };
    const now = new Date();

    // Update phase-specific fields
    if (phase === 'Phase2_Televerification') {
      updateData.phase2TeleverificationNotes = notes;
      updateData.phase2ReviewedBy = req.user.id;
      updateData.phase2ReviewedAt = now;
    } else if (phase === 'Phase3_PanelInterview') {
      updateData.phase3PanelInterviewNotes = notes;
      updateData.phase3ReviewedBy = req.user.id;
      updateData.phase3ReviewedAt = now;
    } else if (phase === 'Phase1_Selection') {
      updateData.phase1Notes = notes;
      updateData.phase1ReviewedBy = req.user.id;
      updateData.phase1ReviewedAt = now;
    }

    // If selected, create Student record
    if (phase === 'Selected') {
      const student = await prisma.student.create({
        data: {
          name: application.name,
          phase: 'Selection',
          medium: application.medium,
          district: application.district,
          requestedSubjects: application.requestedSubjects,
          guardianContactEncrypted: application.guardianContactEncrypted,
        },
      });

      updateData.studentId = student.id;
      updateData.phase3ReviewedBy = req.user.id;
      updateData.phase3ReviewedAt = now;
      updateData.phase3PanelInterviewNotes = notes || application.phase3PanelInterviewNotes;

      logAction(req.user, 'SELECT_STUDENT', `Selected student ${application.name} from application ${id}`, 'StudentApplication', id);
    }

    const updated = await prisma.studentApplication.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: { id: true, name: true, phase: true },
        },
      },
    });

    logAction(req.user, 'UPDATE_APPLICATION_PHASE', `Updated application ${id} to phase ${phase}`, 'StudentApplication', id);

    res.json({ application: updated });
  } catch (error) {
    next(error);
  }
};

// Get applications by phase (for phase-specific views)
const getApplicationsByPhase = async (req, res, next) => {
  try {
    const { phase } = req.params;
    const applications = await prisma.studentApplication.findMany({
      where: { phase },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        phase1Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase2Reviewer: {
          select: { id: true, name: true, email: true },
        },
        phase3Reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

export {
  createApplication,
  listApplications,
  getApplication,
  updateApplicationPhase,
  getApplicationsByPhase,
};

