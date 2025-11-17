const dataStore = require('../models/dataStore');
const { decrypt, maskValue } = require('../utils/security');

const groupBy = (items, key) =>
  items.reduce((acc, item) => {
    const group = item[key] || 'unknown';
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

const getDashboard = (req, res) => {
  const totalClasses = dataStore.classes.length;
  const upcoming = dataStore.classes.filter((cls) => new Date(cls.startTime) > new Date()).length;
  const attendanceRate =
    dataStore.attendance.reduce((acc, entry) => acc + (entry.present ? 1 : 0), 0) /
    Math.max(dataStore.attendance.length, 1);

  res.json({
    meta: {
      totalTutors: dataStore.tutors.length,
      totalStudents: dataStore.students.length,
      totalClasses,
      upcomingClasses: upcoming,
      attendanceRate: Math.round(attendanceRate * 100),
    },
    workloadByPhase: groupBy(dataStore.classes, 'phase'),
    onboardingQueue: dataStore.onboardingRequests.slice(-5),
    swapQueue: dataStore.swapRequests.slice(-5),
    students: dataStore.students.slice(0, 5).map((student) => ({
      ...student,
      guardianContact: maskValue(decrypt(student.guardianContact), 3),
    })),
    role: req.user.role,
  });
};

module.exports = {
  getDashboard,
};

