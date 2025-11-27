const { Router } = require('express');
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const onboardingRoutes = require('./onboarding');
const scheduleRoutes = require('./schedule');
const attendanceRoutes = require('./attendance');
const dataRoutes = require('./data');

const adminRoutes = require('./adminRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/data', dataRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

