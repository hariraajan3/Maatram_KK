const { Router } = require('express');
const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const onboardingRoutes = require('./onboarding');
const scheduleRoutes = require('./schedule');
const attendanceRoutes = require('./attendance');
const dataRoutes = require('./data');

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/data', dataRoutes);

module.exports = router;

