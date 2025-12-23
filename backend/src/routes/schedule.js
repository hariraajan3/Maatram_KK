import express from 'express';
import validator from 'express-validator';
import {
  listClasses,
  createClass,
  createSwapRequest,
  updateSwapRequest,
} from '../controllers/scheduleController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEADS', 'TUTOR', 'CLASS_INSPECTION_TEAM'), listClasses);
router.post(
  '/',
  withAuth,
  requireRole('ADMIN', 'TUTOR_LEADS'),
  body('phase').isString(),
  body('tutorId').isString(),
  body('studentGroup').isString(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  createClass,
);
router.post(
  '/swap',
  withAuth,
  requireRole('TUTOR', 'ADMIN', 'TUTOR_LEADS'),
  body('classId').isString(),
  body('reason').isLength({ min: 10 }),
  body('proposedByTutorId').isString(),
  body('targetTutorId').isString(),
  body('desiredDate').isISO8601(),
  createSwapRequest,
);
router.patch('/swap/:id', withAuth, requireRole('ADMIN', 'TUTOR_LEADS'), updateSwapRequest);

export default router;

