import express from 'express';
import validator from 'express-validator';
import {
  createOnboarding,
  updateOnboardingStatus,
  listOnboarding,
} from '../controllers/onboardingController.js';
import { requireRole, withAuth } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEAD'), listOnboarding);
router.post(
  '/',
  withAuth,
  requireRole('ADMIN', 'TUTOR_LEAD'),
  body('name').isString(),
  body('email').isEmail(),
  body('medium').optional().isIn(['Tamil', 'English']),
  body('district').optional().isIn(['Chennai', 'Coimbatore', 'Other']),
  body('subject').optional().isString(),
  createOnboarding,
);
router.patch('/:id', withAuth, requireRole('ADMIN', 'TUTOR_LEAD'), updateOnboardingStatus);

export default router;

