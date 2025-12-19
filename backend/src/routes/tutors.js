import express from 'express';
import { withAuth } from '../middlewares/auth.js';
import {
    listTutors,
    createTutor,
    getTutorStudents,
    getTutorAttendanceHistory,
    getMyStudents,
    recordTutorAttendance,
} from '../controllers/tutorController.js';

const router = express.Router();

// All routes require authentication
router.use(withAuth);

// Admin: List all tutors
router.get('/', listTutors);

// Admin: Create a new tutor
router.post('/', createTutor);

// Admin: Get students assigned to a specific tutor
router.get('/:tutorId/students', getTutorStudents);

// Admin: Get attendance history for a specific tutor
router.get('/:tutorId/attendance-history', getTutorAttendanceHistory);

export default router;
