import express from 'express';
import { withAuth } from '../middlewares/auth.js';
import {
    getMyStudents,
    recordTutorAttendance,
} from '../controllers/tutorController.js';

const router = express.Router();

// All routes require authentication
router.use(withAuth);

// Tutor: Get their assigned students
router.get('/my-students', getMyStudents);

// Tutor: Record attendance for their students
router.post('/attendance', recordTutorAttendance);

export default router;
