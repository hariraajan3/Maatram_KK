const { Router } = require('express');
const { body } = require('express-validator');
const { recordAttendance, listAttendance } = require('../controllers/attendanceController');
const { withAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', withAuth, listAttendance);
router.post(
  '/',
  withAuth,
  body('classId').isString(),
  body('studentId').isString(),
  body('present').isBoolean(),
  recordAttendance,
);

module.exports = router;

