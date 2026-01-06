import { login } from '../middlewares/auth.js';
import prisma from '../../lib/prisma.js';
import { verifyToken } from '../config/auth.js';
import bcrypt from 'bcryptjs';

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const meHandler = (req, res) => {
  res.json({ user: { id: req.user.id, role: req.user.role, name: req.user.name, email: req.user.email } });
};

const setupAccountHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.purpose !== 'setup_account') {
      return res.status(400).json({ message: 'Invalid or expired setup token' });
    }

    // Changed from TutorOnboarding to OnboardingUsers
    const onboarding = await prisma.OnboardingUsers.findUnique({
      where: { id: decoded.onboardingId }
    });

    if (!onboarding || onboarding.onboardingStatus === 'completed') {
      return res.status(400).json({ message: 'Onboarding already completed or not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: onboarding.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const userData = {
      name: onboarding.fullName,
      email: onboarding.email,
      password: hashedPassword,
      role: onboarding.role,
      tutor: onboarding.role === 'TUTOR' ? {
        create: {
          kkId: `TUTOR-${Date.now()}`,
          tutoringMedium: onboarding.medium,
          tutoringDistrict: onboarding.district,
          tutoringSubjects: onboarding.subject,
          // These fields are required by your schema (schema.prisma)
          tutorAddress: 'N/A',
          phoneNumber: 'N/A',
          collegeOrCompany: 'N/A',
          alumniOrYearStudying: 'N/A',
          tutoringExperienceYears: 0,
          onboardingStatus: 'completed'
        }
      } : undefined
    };

    let user;
    try {
      user = await prisma.user.create({ data: userData });
    } catch (e) {
      if (e.code === 'P2002') {
        // Fix ID sequence out of sync
        await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"user"', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM "user"), false)`;
        // Retry
        user = await prisma.user.create({ data: userData });
      } else {
        throw e;
      }
    }

    // Mark onboarding as completed
    await prisma.OnboardingUsers.update({
      where: { id: onboarding.id },
      data: { onboardingStatus: 'completed', acceptedOn: new Date() }
    });

    res.json({ message: 'Account setup successful. You can now login.', user });
    return;
  }
  catch (error) {
    console.error("Error in setupAccountHandler:", error); // Log the full error
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Setup link has expired. Please contact admin.' });
    }
    next(error);
  }
}
export { loginHandler, meHandler, setupAccountHandler };
