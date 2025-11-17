const { Router } = require('express');
const { body } = require('express-validator');
const {
  createOnboarding,
  updateOnboardingStatus,
  listOnboarding,
} = require('../controllers/onboardingController');
const { requireRole, withAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', withAuth, requireRole('admin', 'tutorLead'), listOnboarding);
router.post(
  '/',
  withAuth,
  requireRole('admin', 'tutorLead', 'coordinator'),
  body('name').isString(),
  body('email').isEmail(),
  body('phone').isString().isLength({ min: 10 }),
  createOnboarding,
);
router.patch('/:id', withAuth, requireRole('admin', 'tutorLead'), updateOnboardingStatus);

module.exports = router;

