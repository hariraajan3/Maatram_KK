import validator from 'express-validator';
import prisma from '../../lib/prisma.js';
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
    const {
      name,
      schoolName,
      address,
      district,
      medium,
      email,
      yearOfStudy,
      publicMark,
      subjectMarks,
      phone,
      parentName,
      tutoringSubjects
    } = req.body;

    // Generate robust sequential KK ID
    const lastStudent = await prisma.student.findFirst({
      orderBy: { kkId: 'desc' },
      where: { kkId: { startsWith: 'KK2025' } }
    });

    let nextNum = 1;
    if (lastStudent && lastStudent.kkId) {
      const match = lastStudent.kkId.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    const kkId = `KK2025${nextNum.toString().padStart(3, '0')}`;

    const application = await prisma.studentApplication.create({
      data: {
        student: {
          create: {
            kkId,
            name,
            schoolName: schoolName || null,
            address: address || null,
            district: district || null,
            medium: medium || null,
            email: email || null,
            yearOfStudying: yearOfStudy || '12th',
            class11PublicMarks: publicMark ? parseInt(publicMark) : null,
            subjectMarks: subjectMarks ? { text: subjectMarks } : {},
            phoneNumber: phone || null,
            parentName: parentName || null,
            tutoringSubjects: tutoringSubjects || [],
          }
        },
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
      schoolName: app.student?.schoolName,
      address: app.student?.address,
      yearOfStudying: app.student?.yearOfStudying,
      class11PublicMarks: app.student?.class11PublicMarks,
      subjectMarks: app.student?.subjectMarks,
      parentName: app.student?.parentName,
      kkId: app.student?.kkId,
    }));

    res.json({ applications: flattened });
  } catch (error) {
    console.error('Error in listApplications:', error);
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

// Update a student's profile information
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      schoolName,
      address,
      district,
      medium,
      email,
      yearOfStudy,
      publicMark,
      subjectMarks,
      phone,
      parentName,
      tutoringSubjects
    } = req.body;

    // Handle both numeric ID and kkId
    const numId = parseInt(id);
    const whereClause = (numId && !isNaN(numId)) ? { id: numId } : { kkId: id };

    const student = await prisma.student.update({
      where: whereClause,
      data: {
        name,
        schoolName,
        address,
        district,
        medium,
        email,
        yearOfStudying: yearOfStudy,
        class11PublicMarks: publicMark ? parseInt(publicMark) : null,
        subjectMarks: subjectMarks ? { text: subjectMarks } : {},
        phoneNumber: phone,
        parentName,
        tutoringSubjects: tutoringSubjects || [],
      }
    });

    logAction(req.user, 'UPDATE_STUDENT', `Updated profile for ${name}`, 'Student', id);
    res.json({ student });
  } catch (error) {
    next(error);
  }
};

// Update application phase (Phase 1 -> Phase 2 -> Phase 3 -> Selected/Rejected)
const updateApplicationPhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phase, notes } = req.body;

    // Find student by ID (KKID or numeric ID)
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { kkId: id.toString() },
          { id: (parseInt(id) && !isNaN(parseInt(id))) ? parseInt(id) : -1 }
        ]
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const application = await prisma.studentApplication.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        currentPhase: 'TELE_VERIFICATION',
        teleStatus: 'PENDING'
      },
      include: { student: true }
    });

    let updateData = {};
    let studentUpdateData = {};

    // Map frontend phase strings to DB Schema (3-Phase flow)
    if (phase === 'Phase2_PanelInterview') {
      updateData.currentPhase = 'PANEL_INTERVIEW';
      updateData.teleStatus = 'SELECTED';
      updateData.phase1Notes = notes; // Notes from finishing Tele-verification
    } else if (phase === 'Phase3_FinalSelection') {
      updateData.currentPhase = 'FINAL_SELECTION';
      updateData.panelStatus = 'SELECTED';
      updateData.finalStatus = 'SELECTED';
      updateData.phase2Notes = notes; // Notes from finishing Panel Interview
      studentUpdateData.phase = 'Scheduling';
    } else if (phase === 'Rejected') {
      updateData.finalStatus = 'REJECTED';
      if (application.currentPhase === 'TELE_VERIFICATION') {
        updateData.phase1Notes = notes;
        updateData.teleStatus = 'REJECTED';
      } else if (application.currentPhase === 'PANEL_INTERVIEW') {
        updateData.phase2Notes = notes;
        updateData.panelStatus = 'REJECTED';
      }
    }

    const updated = await prisma.studentApplication.update({
      where: { id: application.id },
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

const getApplicationsByPhase = async (req, res, next) => {
  try {
    const { phase } = req.params;
    const where = {};

    // Standardized 3-Phase Mapping
    if (phase === 'Phase1_Televerification' || phase === 'phase1') {
      where.currentPhase = 'TELE_VERIFICATION';
      where.finalStatus = { not: 'REJECTED' };
    } else if (phase === 'Phase2_PanelInterview' || phase === 'phase2') {
      where.currentPhase = 'PANEL_INTERVIEW';
      where.finalStatus = { not: 'REJECTED' };
    } else if (phase === 'Phase3_FinalSelection' || phase === 'phase3') {
      where.currentPhase = 'FINAL_SELECTION';
    } else {
      where.currentPhase = 'TELE_VERIFICATION';
      where.finalStatus = { not: 'REJECTED' };
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
      tutoringSubjects: app.student?.tutoringSubjects || [],
      phoneNumber: app.student?.phoneNumber,
      schoolName: app.student?.schoolName,
      address: app.student?.address,
      yearOfStudying: app.student?.yearOfStudying,
      class11PublicMarks: app.student?.class11PublicMarks,
      subjectMarks: app.student?.subjectMarks,
      parentName: app.student?.parentName,
      kkId: app.student?.kkId,
      studentId: app.student?.id
    }));
    console.log(flattened)

    // Calculate basic stats for the current view
    const stats = {
      totalStudents: flattened.length,
      approved: flattened.filter(a =>
        (phase.includes('Tele') && a.teleStatus === 'SELECTED') ||
        (phase.includes('Panel') && a.panelStatus === 'SELECTED') ||
        (phase.includes('Final') && a.finalStatus === 'SELECTED')
      ).length,
      rejected: flattened.filter(a => a.finalStatus === 'REJECTED' || a.teleStatus === 'REJECTED' || a.panelStatus === 'REJECTED').length,
    };

    res.json({ applications: flattened, stats });
  } catch (error) {
    fs.appendFileSync('error_log.txt', `\n[${new Date().toISOString()}] ${error.message}\n${error.stack}\n`);
    console.error('Error in getApplicationsByPhase:', error);
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

    let kkId = existingStudent ? existingStudent.kkId : null;
    if (!kkId) {
      const lastStudent = await prisma.student.findFirst({
        orderBy: { kkId: 'desc' },
        where: { kkId: { startsWith: 'KK2025' } }
      });

      let nextNum = 1;
      if (lastStudent && lastStudent.kkId) {
        const match = lastStudent.kkId.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[0]) + 1;
      }
      kkId = `KK2025${nextNum.toString().padStart(3, '0')}`;
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
      subjectMarks: subjectMarks ? { text: subjectMarks } : {},
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
  updateStudent,
  getApplicationsByPhase,
  handleGFormWebhook,
};

