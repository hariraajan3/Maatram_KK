const dataStore = require('../models/dataStore');
const { encrypt } = require('../utils/security');

const importStudents = (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ message: 'students must be an array' });
  }
  students.forEach((student) => {
    dataStore.students.push({
      ...student,
      guardianContact: encrypt(student.guardianContact || ''),
    });
  });
  res.json({ count: students.length });
};

const exportStudents = (_req, res) => {
  res.json({
    students: dataStore.students.map((student) => ({
      id: student.id,
      name: student.name,
      phase: student.phase,
      group: student.group,
    })),
  });
};

module.exports = {
  importStudents,
  exportStudents,
};

