import express from 'express';
import validator from 'express-validator';
import {
  createApplication,
  getApplicationsByPhase,
  handleGFormWebhook,
  updateStudent,
  studentRejected,
  phaseAdvanced,
  getRejectedApplications,
  selectionStats
} from '../controllers/selectionController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const { body, param } = validator;
const router = express.Router();

// Public Webhook for Google Forms
router.post('/webhook', handleGFormWebhook);

router.use(withAuth);

// Create new application
router.post(
  '/',
  requireRole('ADMIN', 'SELECTION_TEAM'),
  body('name').isString().notEmpty(),
  body('schoolName').isString().notEmpty(),
  body('address').isString().notEmpty(),
  body('district').notEmpty(),
  body('medium').isIn(['Tamil', 'English']),
  body('email').isEmail(),
  body('yearOfStudying').isIn(['12th']),
  body('publicMark').notEmpty(),
  body('subjectMarks').isObject().notEmpty(),
  body('phoneNumber').isString().notEmpty(),
  body('parentName').isString().notEmpty(),
  body('tutoringSubjects').isArray(),
  createApplication,
);

// Get applications by specific phase - dynamic endpoint 
router.get('/phases/:phase', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'),
 getApplicationsByPhase 
);

router.get('/rejected', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), getRejectedApplications);

//Application Rejected 
router.patch(
  '/:id/reject',
  requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'),
  studentRejected,
);

//Advanced to next phase
router.patch(
  '/:id/advance',
  requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'),
  phaseAdvanced,
);

// Update student profile
router.put('/:id/student', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), updateStudent);

router.get('/stats', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), selectionStats);

export default router;
