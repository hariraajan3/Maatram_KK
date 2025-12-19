import express from 'express';
import validator from 'express-validator';
import {
  createApplication,
  listApplications,
  getApplication,
  updateApplicationPhase,
  getApplicationsByPhase,
} from '../controllers/selectionController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

// All routes require authentication
router.use(withAuth);

// Create new application (Phase 1)
router.post(
  '/',
  requireRole('admin', 'coordinator'),
  body('name').isString().notEmpty(),
  body('medium').optional().isIn(['Tamil', 'English']),
  body('district').optional().isIn(['Chennai', 'Coimbatore', 'Other']),
  body('requestedSubjects').optional().isArray(),
  createApplication,
);

// List all applications (with optional filters)
router.get('/', requireRole('admin', 'tutorLead', 'coordinator'), listApplications);

// Get applications by specific phase - simple endpoints like admin logs
router.get('/phase1', requireRole('admin', 'tutorLead', 'coordinator'), (req, res, next) => {
  req.params.phase = 'Phase1_Selection';
  getApplicationsByPhase(req, res, next);
});

router.get('/phase2', requireRole('admin', 'tutorLead', 'coordinator'), (req, res, next) => {
  req.params.phase = 'Phase2_Televerification';
  getApplicationsByPhase(req, res, next);
});

router.get('/phase3', requireRole('admin', 'tutorLead', 'coordinator'), (req, res, next) => {
  req.params.phase = 'Phase3_PanelInterview';
  getApplicationsByPhase(req, res, next);
});

// Get single application
router.get('/:id', requireRole('admin', 'tutorLead', 'coordinator'), getApplication);

// Update application phase
router.patch(
  '/:id/phase',
  requireRole('admin', 'tutorLead', 'coordinator'),
  body('phase').isIn(['Phase1_Selection', 'Phase2_Televerification', 'Phase3_PanelInterview', 'Selected', 'Rejected']),
  body('notes').optional().isString(),
  updateApplicationPhase,
);

export default router;
