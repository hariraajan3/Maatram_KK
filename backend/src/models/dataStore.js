const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/security');

const now = Date.now();
const daysFromNow = (days) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

const seededUsers = [
  {
    id: uuid(),
    name: 'Akila Admin',
    email: 'admin@maatram.org',
    passwordHash: bcrypt.hashSync('admin@123', 10),
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Akila+Admin',
  },
  {
    id: uuid(),
    name: 'Latha Lead',
    email: 'lead@maatram.org',
    passwordHash: bcrypt.hashSync('lead@123', 10),
    role: 'tutorLead',
    avatar: 'https://ui-avatars.com/api/?name=Latha+Lead',
  },
  {
    id: uuid(),
    name: 'Siva Tutor',
    email: 'tutor@maatram.org',
    passwordHash: bcrypt.hashSync('tutor@123', 10),
    role: 'tutor',
    avatar: 'https://ui-avatars.com/api/?name=Siva+Tutor',
  },
  {
    id: uuid(),
    name: 'Priya Coordinator',
    email: 'coord@maatram.org',
    passwordHash: bcrypt.hashSync('coord@123', 10),
    role: 'coordinator',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Coord',
  },
];

const seededStudents = [
  {
    id: uuid(),
    name: 'Mani K',
    phase: 'Selection',
    guardianContact: encrypt('9840011111'),
    group: 'KK-2025-A',
    progressScore: 78,
  },
  {
    id: uuid(),
    name: 'Harini D',
    phase: 'Scheduling',
    guardianContact: encrypt('9898912312'),
    group: 'KK-2025-B',
    progressScore: 84,
  },
  {
    id: uuid(),
    name: 'Kumar S',
    phase: 'Attendance',
    guardianContact: encrypt('9003012211'),
    group: 'KK-2025-C',
    progressScore: 66,
  },
];

const addMinutes = (dateIso, minutes) => {
  const date = new Date(dateIso);
  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
};

const seededClasses = [
  {
    id: uuid(),
    phase: 'Selection',
    tutorId: seededUsers[2].id,
    studentGroup: 'KK-2025-A',
    startTime: daysFromNow(1),
    endTime: addMinutes(daysFromNow(1), 90),
    status: 'scheduled',
    modality: 'virtual',
  },
  {
    id: uuid(),
    phase: 'Scheduling',
    tutorId: seededUsers[2].id,
    studentGroup: 'KK-2025-B',
    startTime: daysFromNow(2),
    endTime: addMinutes(daysFromNow(2), 90),
    status: 'scheduled',
    modality: 'in-person',
  },
];

const dataStore = {
  users: seededUsers,
  tutors: [
    {
      id: seededUsers[2].id,
      name: 'Siva Tutor',
      email: 'tutor@maatram.org',
      phone: encrypt('9876543210'),
      status: 'active',
      subjects: ['Math', 'Science'],
      avgAttendance: 92,
    },
  ],
  students: seededStudents,
  classes: seededClasses,
  sessions: [],
  onboardingRequests: [],
  swapRequests: [],
  attendance: [],
  archivedRecords: [],
  auditLogs: [],
  roles: [
    {
      name: 'admin',
      permissions: ['all'],
    },
    {
      name: 'tutorLead',
      permissions: ['view_tutors', 'manage_onboarding', 'view_classes'],
    },
    {
      name: 'tutor',
      permissions: ['view_own_classes', 'mark_attendance'],
    },
    {
      name: 'coordinator', // Class tracking team
      permissions: ['view_classes', 'manage_schedule', 'view_attendance'],
    },
  ],
};

module.exports = dataStore;

