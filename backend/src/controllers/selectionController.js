import validator from 'express-validator';
import prisma from '../../lib/prisma.js';
import { encrypt } from '../utils/security.js';
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
        student: {
          create: {
            name,
            email: email || null,
            phoneNumber: phone || null,
            // guardianContactEncrypted: guardianContact ? encrypt(guardianContact) : null, // Removed as Student model doesn't have this encrypted field in provided schema
            // Using standard fields from Schema:
            parentName: guardianContact || null, // Mapping guardianContact to parentName?
            district: district || null,
            tutoringSubjects: requestedSubjects || [],
            kkId: `TEMP-${Date.now()}`, // Schema requires kkId (String @unique)
            yearOfStudying: '12th', // Default
            class11PublicMarks: {},
            subjectMarks: {},
          }
        },
        // currentPhase defaults to TELE_VERIFICATION
      },
      include: {
        student: true
      }
    });

    logAction(req.user, 'CREATE_APPLICATION', `Created student application for ${name}`, 'StudentApplication', application.id);

    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
};

// List all applications with optional phase filter
// List all applications with optional phase filter
const listApplications = async (req, res, next) => {
  try {
    const { phase, medium, district } = req.query;
    const where = {};

    if (phase) {
      // Simple mapping or exact match if frontend is updated. 
      // Assuming frontend sends Old Phase Strings, we map them.
      if (phase === 'Phase1_Selection' || phase === 'Phase2_Televerification') where.currentPhase = 'TELE_VERIFICATION';
      else if (phase === 'Phase3_PanelInterview') where.currentPhase = 'PANEL_INTERVIEW';
      else where.currentPhase = phase; // Fallback
    }
    // Student fields are not directly on StudentApplication, need to filter by student relation
    if (medium) where.student = { is: { medium } }; // Assuming generic structure
    if (district) where.student = { is: { district } };

    const applications = await prisma.studentApplication.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const flattened = applications.map(app => ({
      ...app,
      name: app.student?.name,
      email: app.student?.email,
      district: app.student?.district,
      medium: app.student?.medium,
      requestedSubjects: app.student?.tutoringSubjects || [],
      phoneNumber: app.student?.phoneNumber,
    }));

    res.json({ applications: flattened });
  } catch (error) {
    next(error);
  }
};

// Get single application
const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await prisma.studentApplication.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: true,
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
      where: { id: parseInt(id) },
      include: { student: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let updateData = {};
    let studentUpdateData = {};

    // Map frontend phase strings to DB Schema
    if (phase === 'Phase2_Televerification') {
      updateData.currentPhase = 'TELE_VERIFICATION';
      updateData.teleStatus = 'SELECTED';
      updateData.phase1Notes = notes; // Notes from finishing Phase 1
    } else if (phase === 'Phase3_PanelInterview') {
      updateData.currentPhase = 'PANEL_INTERVIEW';
      updateData.panelStatus = 'SELECTED';
      updateData.phase2TeleverificationNotes = notes; // Notes from finishing Phase 2
    } else if (phase === 'Selected') {
      updateData.currentPhase = 'FINAL_SELECTION';
      updateData.finalStatus = 'SELECTED';
      updateData.phase3PanelInterviewNotes = notes; // Notes from finishing Phase 3
      // Student moves to Scheduling phase
      studentUpdateData.phase = 'Scheduling';
    } else if (phase === 'Phase4_Scheduling') {
      // Just in case they move to Phase 4 explicitly
      updateData.currentPhase = 'FINAL_SELECTION';
      studentUpdateData.phase = 'Scheduling';
    } else if (phase === 'Rejected') {
      updateData.finalStatus = 'REJECTED';
      // Store rejection reason in the notes of the current phase? 
      // For simplicity, let's just use the current phase's note field or a generic one.
      // But we'll just save it to whatever phase it was in.
      if (application.currentPhase === 'TELE_VERIFICATION') {
        if (application.teleStatus === 'PENDING') updateData.phase1Notes = notes;
        else updateData.phase2TeleverificationNotes = notes;
      } else if (application.currentPhase === 'PANEL_INTERVIEW') {
        updateData.phase3PanelInterviewNotes = notes;
      }
    }

    const updated = await prisma.studentApplication.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        student: studentUpdateData.phase ? {
          update: {
            phase: studentUpdateData.phase
          }
        } : undefined
      },
      include: {
        student: true,
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
    const where = {};

    if (phase === 'Phase1_Selection') {
      where.currentPhase = 'TELE_VERIFICATION';
      where.teleStatus = 'PENDING';
    } else if (phase === 'Phase2_Televerification') {
      where.currentPhase = 'TELE_VERIFICATION';
      where.teleStatus = 'SELECTED';
    } else if (phase === 'Phase3_PanelInterview') {
      where.currentPhase = 'PANEL_INTERVIEW';
    } else if (phase === 'Phase4_Scheduling' || phase === 'FINAL_SELECTION') {
      where.currentPhase = 'FINAL_SELECTION';
    } else {
      where.currentPhase = 'TELE_VERIFICATION';
    }

    const applications = await prisma.studentApplication.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { createdAt: 'desc' },
    });

    const flattened = applications.map(app => ({
      ...app,
      name: app.student?.name,
      email: app.student?.email,
      district: app.student?.district,
      medium: app.student?.medium,
      requestedSubjects: app.student?.tutoringSubjects || [],
      phoneNumber: app.student?.phoneNumber,
    }));

    res.json({ applications: flattened });
  } catch (error) {
    next(error);
  }
};

// Google Form Webhook Handler
const handleGFormWebhook = async (req, res, next) => {
  try {
    const secret = req.headers['x-webhook-secret'];
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      console.warn('Webhook Unauthorized Attempt:', req.ip);
      console.log('Secret:', secret);
      console.log('Expected Secret:', process.env.WEBHOOK_SECRET);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      name,
      email,
      phoneNumber,
      schoolName,
      address,
      district,
      parentName,
      yearOfStudy,
      publicMark,
      subjectMarks,
      medium,
      tutoringSubjects
    } = req.body;

    console.log('Received Webhook Payload:', req.body);

    if (!name || (!email && !phoneNumber)) {
      return res.status(400).json({ message: 'Name and either Email or Phone are required' });
    }

    // Check for existing student by email or phone
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined }
        ]
      }
    });

    // Generate sequential KK ID only for new students
    let kkId = existingStudent ? existingStudent.kkId : null;
    if (!kkId) {
      const count = await prisma.student.count();
      kkId = `KK2025${(count + 1).toString().padStart(3, '0')}`;
    }

    let student;
    const studentData = {
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      schoolName: schoolName || null,
      address: address || null,
      district: district || null,
      parentName: parentName || null,
      yearOfStudying: yearOfStudy || '12th',
      class11PublicMarks: publicMark ? parseInt(publicMark) : null,
      subjectMarks: subjectMarks || {},
      tutoringSubjects: tutoringSubjects || [],
      medium: medium || null,
      kkId
    };

    if (existingStudent) {
      console.log('Updating existing student:', existingStudent.id);
      student = await prisma.student.update({
        where: { id: existingStudent.id },
        data: studentData
      });
    } else {
      console.log('Creating new student');
      student = await prisma.student.create({
        data: studentData
      });
    }

    // Create Application
    // Check if application already exists
    const existingApp = await prisma.studentApplication.findUnique({
      where: { studentId: student.id }
    });

    if (!existingApp) {
      await prisma.studentApplication.create({
        data: {
          studentId: student.id,
          currentPhase: 'TELE_VERIFICATION',
          teleStatus: 'PENDING',
        }
      });
      console.log('Application created for student:', student.id);
    } else {
      console.log('Application already exists for student:', student.id);
    }

    res.status(200).json({ message: 'Success', studentId: student.id });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export {
  createApplication,
  listApplications,
  getApplication,
  updateApplicationPhase,
  getApplicationsByPhase,
  handleGFormWebhook,
};

