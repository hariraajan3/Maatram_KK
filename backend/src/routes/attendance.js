import express from 'express';
import validator from 'express-validator';
import { recordAttendance, listAttendance, getTutorAttendanceOverview, getClassAttendanceDetails } from '../controllers/attendanceController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM'), listAttendance);
router.get('/overview', withAuth, requireRole('ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM'), getTutorAttendanceOverview);
router.get('/class/:classId', withAuth, requireRole('ADMIN', 'TUTOR_LEADS', 'ATTENDANCE_TRACKING_TEAM'), getClassAttendanceDetails);
router.post(
  '/',
  withAuth,
  requireRole('ADMIN', 'TUTOR_LEADS', 'TUTOR'),
  body('classId').isString(),
  body('studentId').isString(),
  body('present').isBoolean(),
  recordAttendance,
);

export default router;
