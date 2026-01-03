import prisma from '../../lib/prisma.js';
import { sendMail } from '../config/email.js';
import { logAction } from '../utils/auditLogger.js';
import { signToken } from '../config/auth.js';

const createOnboarding = async (req, res, next) => {
  try {
    const { name, email, role, medium, district, subject } = req.body;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Map frontend roles to backend Prisma Enum (e.g., tutorLead -> TUTOR_LEAD)
    const roleMapping = {
      'admin': 'ADMIN',
      'tutorLead': 'TUTOR_LEAD',
      'tutor': 'TUTOR',
      'selectionTeam': 'SELECTION_TEAM',
      'attendanceTrackingTeam': 'ATTENDANCE_TRACKING_TEAM',
      'studentsTrackingTeam': 'CLASS_INSPECTION_TEAM', // Assuming this mapping
    };

    const prismaRole = roleMapping[role] || role.replace(/([A-Z])/g, '_$1').toUpperCase();

    // Create or update onboarding record
    const request = await prisma.OnboardingUsers.create({
      data: {
        fullName: name,
        email: email,
        role: prismaRole,
        medium: medium || null,
        district: district || null,
        subject: subject || null,
        onboardingStatus: 'pending'
      },
    });
    console.log('Onboarding record created:', request);

    // Generate token for setting password (valid for 7 days)
    const token = signToken({
      onboardingId: request.id,
      email: request.email,
      purpose: 'setup_account'
    });
    console.log('Token generated:', token);

    const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/set-password?token=${token}`;

    await sendMail({
      to: email,
      from: req.user.email,
      subject: 'Welcome to Maatram - Complete Your Registration',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #000;">Welcome to Maatram Foundation!</h2>
          <p>Hi ${name},</p>
          <p>You have been invited to join the Maatram KK platform as a <strong>${role}</strong>.</p>
          <p>To get started and access your account, please click the button below to set your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set My Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">${setupUrl}</p>
          <p>This link will expire in 7 days.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you were not expecting this invitation, please ignore this email.</p>
        </div>
      `,
    });

    logAction(req.user, 'CREATE_ONBOARDING', `Created onboarding invitation for ${name} (${role})`, 'TutorOnboarding', request.id);

    res.status(201).json({ message: 'Invitation sent successfully', request });
  } catch (error) {
    console.error('Onboarding Error:', error);
    next(error);
  }
};

const updateOnboardingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.tutorOnboarding.update({
      where: { id: parseInt(id) },
      data: { onboardingStatus: status }
    });

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const listOnboarding = async (_req, res, next) => {
  try {
    const requests = await prisma.tutorOnboarding.findMany({
      orderBy: { invitedOn: 'desc' }
    });
    // Transform fields to match frontend expectations if necessary
    const transformed = requests.map(r => ({
      ...r,
      name: r.fullName,
      createdAt: r.invitedOn,
      status: r.onboardingStatus
    }));
    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

export { createOnboarding, updateOnboardingStatus, listOnboarding };
