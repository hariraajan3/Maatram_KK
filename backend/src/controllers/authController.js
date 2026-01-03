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

    const onboarding = await prisma.tutorOnboarding.findUnique({
      where: { id: decoded.onboardingId }
    });

    if (!onboarding || onboarding.onboardingStatus === 'completed') {
      return res.status(400).json({ message: 'Onboarding already completed or not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: onboarding.email,
          password: hashedPassword,
          name: onboarding.fullName,
          role: onboarding.role,
        }
      });

      // 2. Create role-specific profile
      if (onboarding.role === 'TUTOR') {
        await tx.tutor.create({
          data: {
            userId: user.id,
            kkId: `TUTOR-${Date.now()}`, // Simple unique ID generator
            tutoringSubjects: onboarding.subject,
            tutoringDistrict: onboarding.district,
            tutoringMedium: onboarding.medium,
            tutorAddress: 'Please update your address', // Default
            phoneNumber: onboarding.phoneNumber || '',
            collegeOrCompany: 'N/A',
            alumniOrYearStudying: 'N/A',
            tutoringExperienceYears: 0,
            onboardingStatus: 'completed'
          }
        });
      } else if (onboarding.role === 'TUTOR_LEAD') {
        await tx.tutorLead.create({
          data: {
            userId: user.id,
            phoneNumber: onboarding.phoneNumber,
          }
        });
      } else if (onboarding.role === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: user.id,
            phoneNumber: onboarding.phoneNumber,
          }
        });
      } else if (onboarding.role === 'SELECTION_TEAM') {
        await tx.selectionTeam.create({
          data: {
            userId: user.id,
            phoneNumber: onboarding.phoneNumber,
          }
        });
      } else if (onboarding.role === 'ATTENDANCE_TRACKING_TEAM') {
        await tx.attendanceTrackingTeam.create({
          data: {
            userId: user.id,
            phoneNumber: onboarding.phoneNumber,
          }
        });
      } else if (onboarding.role === 'CLASS_INSPECTION_TEAM') {
        await tx.classInspectionTeam.create({
          data: {
            userId: user.id,
            phoneNumber: onboarding.phoneNumber,
          }
        });
      }

      // 3. Mark Onboarding as completed
      await tx.tutorOnboarding.update({
        where: { id: onboarding.id },
        data: { onboardingStatus: 'completed', acceptedOn: new Date() }
      });

      return user;
    });

    res.json({ message: 'Account setup successful. You can now login.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Setup link has expired. Please contact admin.' });
    }
    next(error);
  }
};

export { loginHandler, meHandler, setupAccountHandler };
