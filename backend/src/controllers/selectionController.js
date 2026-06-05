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

const normalizePublicMark = (value) => {
  if (value === '' || value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeSubjectMarks = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([subject, mark]) => [subject, Number(mark) || 0])
  );
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
      yearOfStudying,
      publicMark,
      subjectMarks,
      phoneNumber,
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
      const match = lastStudent.kkId.match(/(\d{3})$/);
      if (match) nextNum = parseInt(match[0]) + 1;
    }
    const formattedNumber= nextNum.toString().padStart(3, '0');
    const kkId = `KK2025${formattedNumber}`;

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
            yearOfStudying: yearOfStudying || '12th',
            class11PublicMarks: normalizePublicMark(publicMark),
            subjectMarks: normalizeSubjectMarks(subjectMarks),
            phoneNumber: phoneNumber || null,
            parentName: parentName || null,
            tutoringSubjects: tutoringSubjects || [],
          }
        },
      },
      include: {
        student: true
      }
    });
    //logAction(req.user, 'CREATE_APPLICATION', `Created student application for ${name}`, 'StudentApplication', application.id);
   
    res.status(201).json({ application });
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
      yearOfStudying,
      publicMark,
      subjectMarks,
      medium,
      tutoringSubjects
    } = req.body;

    console.log('Received Webhook Payload:', req.body);

    if (!name || (!email && !phoneNumber)) {
      return res.status(400).json({ message: 'Name and either Email or Phone are required' });
    }

    const existingStudent = await prisma.student.findUnique({ where: { email } });

    if (existingStudent) {
      console.log('Existing student found with email:', email);
      res.status(400).json({ message: 'Student with this email already exists', studentId: existingStudent.id });
    }
    
    const lastStudent = await prisma.student.findFirst({
        orderBy: { kkId: 'desc' },
        where: { kkId: { startsWith: 'KK2025' } }
    });

    let kkId;
    let nextNum = 1;
    if (lastStudent && lastStudent.kkId) {
        const match = lastStudent.kkId.match(/(\d{3})$/);
        if (match) nextNum = parseInt(match[0]) + 1;
    }
    kkId = `KK2025${nextNum.toString().padStart(3, '0')}`;


    let student;
    const studentData = {
        name,
        email: email || null,
        phoneNumber: phoneNumber || null,
        schoolName: schoolName || null,
        address: address || null,
        district: district || null,
        parentName: parentName || null,
        yearOfStudying: yearOfStudying || '12th',
        class11PublicMarks: publicMark || null,
        subjectMarks: subjectMarks || {},
        tutoringSubjects: tutoringSubjects || [],
        medium: medium || null,
        kkId
    };

    console.log('Creating new student');
      student = await prisma.student.create({
        data: studentData
    });

    await prisma.studentApplication.create({
        data: {
          studentId: student.id,
          currentPhase: 'TELE_VERIFICATION',
          teleStatus: 'PENDING',
        }
    });
    console.log('Application created for student:', student.id);
       
    res.status(200).json({ message: 'Success', studentId: student.id });
    
  } 
  catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get applications by phase with dynamic endpoint
const getApplicationsByPhase = async (req, res, next) => {
  try {
    const { phase } = req.params;
    const where = {};

    // Standardized 3-Phase Mapping
    if (phase == 'phase1') {
      where.currentPhase = 'TELE_VERIFICATION';
      where.teleStatus = 'PENDING';
    } 
    else if ( phase == 'phase2') {
      where.currentPhase = 'PANEL_INTERVIEW';
      where.teleStatus = 'SELECTED';
      where.panelStatus = 'PENDING';
    } 
    else if (phase == 'phase3') {
      where.currentPhase = 'FINAL_SELECTION';
      where.teleStatus = 'SELECTED';
      where.panelStatus = 'SELECTED';
      
    } 
    else {
       console.log('Unknown phase found:', phase);
       res.status(400).json({ message: 'Invalid phase parameter' });
    }

    const applications = await prisma.studentApplication.findMany({where , 
      include: { 
        student :{
          select:{
            id: true,
            kkId: true,
            name: true,
            email: true,
            phoneNumber: true,
            schoolName: true,
            address: true,
            district: true,
            parentName: true,
            yearOfStudying: true,
            class11PublicMarks: true,
            subjectMarks: true,
            tutoringSubjects: true,
            medium: true,
          }
        }
      }
    });


    // Calculate basic stats for the current view
    const stats = {
      totalStudents: applications.length,
    };

    res.json({ applications: applications , stats });
  } 
  catch (error) {
    console.error('Error in getApplicationsByPhase:', error);
    next(error);
  }
};

// Update a student's profile information
const updateStudent = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const {
      name,
      schoolName,
      address,
      district,
      medium,
      email,
      yearOfStudying,
      publicMark,
      subjectMarks,
      phoneNumber,
      parentName,
      tutoringSubjects
    } = req.body;

    const student = await prisma.student.update({
      where: {id : applicationId} ,
      data: {
        name,
        schoolName,
        address,
        district,
        medium,
        email,
        yearOfStudying: yearOfStudying,
        class11PublicMarks: publicMark || null,
        subjectMarks: subjectMarks || {},
        phoneNumber: phoneNumber || null,
        parentName,
        tutoringSubjects: tutoringSubjects || [],
      }
    });

    //logAction(req.user, 'UPDATE_STUDENT', `Updated profile for ${name}`, 'Student', student.id);
    res.json({ student });
  } catch (error) {
    next(error);
  }
};

//Reject Student Application  
const studentRejected = async (req, res, next) => {
  try {
    respondValidation(req);
    const applicationId = parseInt(req.params.id, 10);
    const { notes } = req.body;

    const application = await prisma.studentApplication.findUnique({
      where: { id: applicationId },
      include: { student: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let updateData = {};
    if (application.currentPhase === 'TELE_VERIFICATION') {
      updateData.teleStatus = 'REJECTED';
      updateData.phase1Notes = notes;
    } else if (application.currentPhase === 'PANEL_INTERVIEW') {
      updateData.panelStatus = 'REJECTED';
      updateData.phase2Notes = notes;
    }

    await prisma.studentApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    console.log('Rejecting application with data');
    res.status(200).json({ message: 'Application rejected' , kkId:application.student.kkId });
  } catch (error) {
    next(error);
  }
};

//Phase Advanced
const phaseAdvanced = async (req, res, next) => {
  try {
    respondValidation(req);
    const applicationId = parseInt(req.params.id, 10);
    const { phase, notes } = req.body ;

    const application = await prisma.studentApplication.findUnique({
      where: { id: applicationId },
      include: { student: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let updateData = {};

    if (phase === "phase1") {
      updateData.currentPhase = 'PANEL_INTERVIEW';
      updateData.teleStatus = 'SELECTED';
      updateData.phase1Notes = notes;
    } else if (phase === "phase2") {
      updateData.currentPhase = 'FINAL_SELECTION';
      updateData.panelStatus = 'SELECTED';
      updateData.phase2Notes = notes;
    }

    console.log("Application ID:", applicationId);
    console.log("Phase:", phase);
    console.log("Update Data:", updateData);

    const updatedApplication = await prisma.studentApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    console.log(updatedApplication);
    res.status(200).json({ message: 'Application phase updated' , kkId: application.student.kkId });
  } catch (error) {
    next(error);
  }
};

const getRejectedApplications = async (req, res, next) => {
  try {
    const applications = await prisma.studentApplication.findMany({
      where: {
        OR: [
          { teleStatus: 'REJECTED' },
          { panelStatus: 'REJECTED' }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            kkId: true,
            name: true,
            email: true,
            phoneNumber: true,
            schoolName: true,
            address: true,
            district: true,
            parentName: true,
            yearOfStudying: true,
            class11PublicMarks: true,
            subjectMarks: true,
            tutoringSubjects: true,
            medium: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

const selectionStats = async (req, res, next) => {
  try {
    const count = await prisma.student.count();
    const selected = await prisma.studentApplication.count({
      where: { currentPhase: 'FINAL_SELECTION' }
    });

    const rejected = await prisma.studentApplication.count({
      where: {
        OR: [
          { teleStatus: 'REJECTED' },
          { panelStatus: 'REJECTED' }
        ]
      }
    });
    res.json({ totalApplications: count, selected, rejected });
  } 
  catch (error) {
    next(error);
  }
};


export {
  createApplication,
  updateStudent,
  getApplicationsByPhase,
  handleGFormWebhook,
  studentRejected,
  phaseAdvanced,
  getRejectedApplications,
  selectionStats
};

