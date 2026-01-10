import express from 'express';
import { getDashboard, getDashboardStudents } from '../controllers/dashboardController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', withAuth, requireRole('ADMIN', 'TUTOR_LEAD', 'SELECTION_TEAM', 'CLASS_INSPECTION_TEAM', 'ATTENDANCE_TRACKING_TEAM'), getDashboard);
router.get('/students', withAuth, requireRole('ADMIN', 'TUTOR_LEAD', 'ATTENDANCE_TRACKING_TEAM'), getDashboardStudents);

export default router;

