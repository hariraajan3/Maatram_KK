const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const dataStore = require('../models/dataStore');

const recordAttendance = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation failed');
      err.status = 422;
      err.details = errors.array();
      throw err;
    }

    const { classId, studentId, present, notes } = req.body;
    const record = {
      id: uuid(),
      classId,
      studentId,
      present,
      notes,
      recordedBy: req.user.id,
      date: new Date().toISOString(),
    };
    dataStore.attendance.push(record);
    res.status(201).json({ record });
  } catch (error) {
    next(error);
  }
};

const listAttendance = (_req, res) => {
  res.json({ attendance: dataStore.attendance.slice(-50) });
};

module.exports = {
  recordAttendance,
  listAttendance,
};

