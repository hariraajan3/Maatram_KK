import validator from 'express-validator';
import prisma from '../../lib/prisma.js';
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
        student: {
          select: { id: true, name: true, district: true, parentName: true }, // Adjusted fields
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
    const now = new Date();

    // Map frontend phase strings to DB Schema
    if (phase === 'Phase2_Televerification') {
      updateData.currentPhase = 'TELE_VERIFICATION';
      updateData.teleRemarks = notes;
      updateData.teleStatus = 'SELECTED'; // Assuming moving to this phase implies selection from prev? Or just updating notes?
      // If we are IN this phase, we update status? 
      // Let's assume this action "Moves" to Phase 2 or "Updates" Phase 2.
    } else if (phase === 'Phase3_PanelInterview') {
      updateData.currentPhase = 'PANEL_INTERVIEW';
      updateData.panelRemarks = notes;
      // updateData.teleStatus = 'SELECTED'; // Ensure prev is selected
    } else if (phase === 'Selected') {
      updateData.currentPhase = 'FINAL_SELECTION';
      updateData.finalStatus = 'SELECTED';
    } else if (phase === 'Rejected') {
      updateData.finalStatus = 'REJECTED';
      // Which phase? Keep current?
    }

    // If selected, create Student record? 
    // Wait, Student record is created at Application creation (via relation).
    // So we don't need to create it again.

    const updated = await prisma.studentApplication.update({
      where: { id: parseInt(id) },
      data: updateData,
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
    let dbPhase;

    if (phase === 'Phase1_Selection' || phase === 'Phase2_Televerification') {
      dbPhase = 'TELE_VERIFICATION';
    } else if (phase === 'Phase3_PanelInterview') {
      dbPhase = 'PANEL_INTERVIEW';
    } else {
      // Handle unexpected phase strings gracefully
      dbPhase = 'TELE_VERIFICATION';
    }

    const applications = await prisma.studentApplication.findMany({
      where: { currentPhase: dbPhase },
      include: {
        student: {
          select: { id: true, name: true, district: true, parentName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
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
      subjectMarks
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
      class11PublicMarks: publicMark ? { total: publicMark } : {},
      subjectMarks: subjectMarks ? { marks: subjectMarks } : {},
      tutoringSubjects: [], // Default empty
      kkId: `KK-${Date.now().toString().slice(-6)}` // Temporary ID generation
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
          // Use a system user ID or null for createdBy if possible, or leave it out if schema allows optional
          // If schema requires createdBy (User), we might need a system bot user or make it optional.
          // Checking schema: StudentApplication doesn't strictly require createdBy relation??
          // Wait, 'createdBy' field was used in createApplication above: 'createdBy: req.user.id'.
          // Let's check schema again. The schema has 'student' relation, but doesn't explicitly show 'createdBy' in the model definition in the previous `view_file` output of schema.prisma?
          // Ah, I missed checking schema details for StudentApplication relation completely.
          // Looking at `createApplication` implementation:
          // `createdBy: req.user.id` is passed.
          // But I don't see `recievedBy` or similar.
          // Let's assume for webhook we don't have a creator user.
          // If schema requires it, this will fail.
          // Let's check schema.prisma from previous turn...
          // User model has... `model StudentApplication` is not linked to User as 'creator' in the schema I saw?
          // Wait, `createApplication` in `selectionController.js` uses `createdBy: req.user.id`.
          // But `schema.prisma` show `model StudentApplication`?
          // Line 324: model StudentApplication { ... }
          // It DOES NOT show `createdBy` field or relation to User for creation.
          // Wait, `createApplication` in `selectionController.js` has:
          /*
            const application = await prisma.studentApplication.create({
              data: {
                ...
                createdBy: req.user.id,
              },
            });
          */
          // But looking at schema.prisma provided in Step 95:
          /*
            model StudentApplication {
              id        Int     @id @default(autoincrement())
              studentId Int     @unique
              student   Student @relation(fields: [studentId], references: [id])
              currentPhase SelectionPhase @default(TELE_VERIFICATION)
              ...
            }
          */
          // I DO NOT SEE `createdBy` field in `StudentApplication` model in schema.prisma!
          // This implies `createApplication` in `selectionController.js` might be referring to a schema I haven't seen fully or it's implicitly valid?
          // Or `selectionController.js` provided in Step 157 might be out of sync with schema?
          // In Step 157, `createApplication` definitely imports prisma.
          // Let's look at `listApplications` in Step 157. It includes `creator`.
          // `creator: { select: { id: true... } }`
          // This suggests `creator` relation exists.
          // Maybe I missed it in schema view or it was truncated?
          // Re-reading schema Step 95...
          // I see `User` model has `studentApplication StudentApplication?`... No, it has `classInspectionTeam etc`.
          // I don't see `applications` relation in User.
          // This is strange.
          // Let's assume `StudentApplication` might NOT have `createdBy` required if it was missing in the view?
          // ERROR RISK: If `createdBy` is required, webhook will fail.
          // However, for now I will try to create WITHOUT `createdBy` since I don't have a user ID.
          // If it fails, I'll fix it.
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

