import express from 'express';
import validator from 'express-validator';
import { recordAttendance, listAttendance, getTutorAttendanceOverview, getClassAttendanceDetails } from '../controllers/attendanceController.js';
import { withAuth } from '../middlewares/auth.js';

const { body } = validator;
const router = express.Router();

router.get('/', withAuth, listAttendance);
router.get('/overview', withAuth, getTutorAttendanceOverview);
router.get('/class/:classId', withAuth, getClassAttendanceDetails);
router.post(
  '/',
  withAuth,
  body('classId').isString(),
  body('studentId').isString(),
  body('present').isBoolean(),
  recordAttendance,
);

export default router;
