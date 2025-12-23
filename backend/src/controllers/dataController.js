import prisma from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';

const generateDummyData = async (req, res) => {
  try {
    console.log('🌱 Starting dummy data generation...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    await prisma.user.upsert({
      where: { email: 'admin@maatram.org' },
      create: {
        email: 'admin@maatram.org',
        passwordHash: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
      update: {},
    });

    // 2. Create Tutor
    const tutorUser = await prisma.user.upsert({
      where: { email: 'dumbdata@maatram.org' },
      create: {
        email: 'dumbdata@maatram.org',
        passwordHash: hashedPassword,
        name: 'Dummy Tutor',
        role: 'TUTOR',
      },
      update: {},
    });

    const tutorProfile = await prisma.tutor.upsert({
      where: { userId: tutorUser.id },
      create: {
        userId: tutorUser.id,
        kkId: 'DUM001',
        tutoringSubjects: ['Maths', 'Physics'],
        tutoringDistrict: 'Chennai',
        tutoringMedium: 'English',
        tutorAddress: 'Dummy Address',
        phoneNumber: '9876543210',
        collegeOrCompany: 'Dummy College',
        alumniOrYearStudying: 'Year 3',
        tutoringExperienceYears: 1,
        onboardingStatus: 'approved',
      },
      update: {},
    });

    // 3. Create Students
    await prisma.student.upsert({
      where: { kkId: 'STU_DUM_01' },
      create: {
        kkId: 'STU_DUM_01',
        name: 'Dummy Student 1',
        district: 'Chennai',
        tutoringSubjects: ['Maths'],
        class11PublicMarks: { maths: 95 },
        subjectMarks: {},
        parentName: 'Parent 1',
        phoneNumber: '1112223334',
      },
      update: {},
    });

    await prisma.student.upsert({
      where: { kkId: 'STU_DUM_02' },
      create: {
        kkId: 'STU_DUM_02',
        name: 'Dummy Student 2',
        district: 'Chennai',
        tutoringSubjects: ['Physics'],
        class11PublicMarks: { physics: 88 },
        subjectMarks: {},
        parentName: 'Parent 2',
        phoneNumber: '5556667778',
      },
      update: {},
    });

    // 4. Create Schedule
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await prisma.schedule.create({
      data: {
        scheduleDate: tomorrow,
        scheduleAt: tomorrow,
        subject: 'Maths',
        medium: 'English',
        district: 'Chennai',
        tutorId: tutorProfile.id,
        status: 'SCHEDULED',
      },
    });

    res.json({ message: 'Dummy data generated successfully', credentials: { email: 'dumbdata@maatram.org', password: 'password123' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating dummy data', error: error.message });
  }
};

const getDatabaseSummary = async (req, res) => {
  try {
    const counts = {
      users: await prisma.user.count(),
      tutors: await prisma.tutor.count(),
      students: await prisma.student.count(),
      schedules: await prisma.schedule.count(),
    };
    res.json({ counts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};

// Keeping existing functions but marking as deprecated if they depend on missing dataStore
const importStudents = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

const exportStudents = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

export { importStudents, exportStudents, generateDummyData, getDatabaseSummary };

