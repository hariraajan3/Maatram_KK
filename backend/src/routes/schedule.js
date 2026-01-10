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

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEAD', 'TUTOR', 'CLASS_INSPECTION_TEAM'), listClasses);
router.post(
  '/',
  withAuth,
  requireRole('TUTOR_LEAD'),
  body('schedules').isArray(),
  createClass,
);
router.post(
  '/swap',
  withAuth,
  requireRole('TUTOR'),
  body('classId').isString(),
  body('reason').isLength({ min: 10 }),
  body('proposedByTutorId').isString(),
  body('targetTutorId').isString(),
  body('desiredDate').isISO8601(),
  createSwapRequest,
);
router.patch('/swap/:id', withAuth, requireRole('ADMIN', 'TUTOR_LEAD'), updateSwapRequest);

export default router;

