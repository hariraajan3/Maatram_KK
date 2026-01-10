import express from 'express';
import validator from 'express-validator';
import {
  createApplication,
  listApplications,
  getApplication,
  updateApplicationPhase,
  getApplicationsByPhase,
  handleGFormWebhook,
  updateStudent
} from '../controllers/selectionController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

// Public Webhook (Secured by Secret Header)
router.post('/webhook', handleGFormWebhook);

// All routes require authentication
router.use(withAuth);

// Create new application (Phase 1)
router.post(
  '/',
  requireRole('SELECTION_TEAM'),
  body('name').isString().notEmpty(),
  body('schoolName').isString().notEmpty(),
  body('address').isString().notEmpty(),
  body('district').notEmpty(),
  body('medium').isIn(['Tamil', 'English']),
  body('email').isEmail(),
  body('yearOfStudy').isIn(['12th']),
  body('publicMark').notEmpty(),
  body('subjectMarks').isString().notEmpty(),
  body('phone').isString().notEmpty(),
  body('parentName').isString().notEmpty(),
  body('tutoringSubjects').isArray(),
  createApplication,
);

// List all applications (with optional filters)
router.get('/', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), listApplications);

// Get applications by specific phase - simple endpoints
router.get('/phase1', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), (req, res, next) => {
  req.params.phase = 'Phase1_Televerification';
  getApplicationsByPhase(req, res, next);
});

router.get('/phase2', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), (req, res, next) => {
  req.params.phase = 'Phase2_PanelInterview';
  getApplicationsByPhase(req, res, next);
});

router.get('/phase3', requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM'), (req, res, next) => {
  req.params.phase = 'Phase3_FinalSelection';
  getApplicationsByPhase(req, res, next);
});

// Get single application
router.get('/:id', requireRole('SELECTION_TEAM'), getApplication);

// Update application phase
router.patch(
  '/:id/phase',
  requireRole('SELECTION_TEAM'),
  body('phase').isIn(['Phase1_Televerification', 'Phase2_PanelInterview', 'Phase3_FinalSelection', 'Rejected']),
  body('notes').optional().isString(),
  updateApplicationPhase,
);

// Update student profile
router.put('/:id/student', requireRole('SELECTION_TEAM'), updateStudent);

export default router;
