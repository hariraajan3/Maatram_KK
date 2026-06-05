import express from 'express';
import dashboardRoutes from './dashboard.js';
import onboardingRoutes from './onboarding.js';
import scheduleRoutes from './schedule.js';
import attendanceRoutes from './attendance.js';
import adminRoutes from './adminRoutes.js';
import selectionRoutes from './selectionRoutes.js';
import tutorsRoutes from './tutors.js';
import tutorRoutes from './tutor.js';
import authRoutes from './authRoutes.js';

import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/admin', adminRoutes);
router.use('/selection', selectionRoutes);
router.use('/tutors', tutorsRoutes);
router.use('/tutor', tutorRoutes);

export default router;

