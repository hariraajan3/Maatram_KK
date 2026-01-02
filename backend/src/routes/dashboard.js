import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEAD', 'studentsTrackingTeam', 'STUDENTS_TRACKING_TEAM'), getDashboard);

export default router;

