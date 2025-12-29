import { v4 as uuid } from 'uuid';
import validator from 'express-validator';
import prisma from '../../lib/prisma.js';
import { encrypt, decrypt } from '../utils/security.js';
import { sendNotificationBundle } from '../utils/notifications.js';
import { sendMail } from '../config/email.js';
import { logAction } from '../utils/auditLogger.js';
import bcrypt from 'bcryptjs';

const { validationResult } = validator;

const respondValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.status = 422;
    err.details = errors.array();
    throw err;
  }
};

const createOnboarding = async (req, res, next) => {
  try {
    respondValidation(req);
    const { name, email, phone, documents, medium, district, subjects } = req.body;
    const request = {
      id: uuid(),
      name,
      email,
      phoneEncrypted: encrypt(phone),
      documents: documents || [],
      medium: medium || null,
      district: district || null,
      subjects: subjects || [],
      status: 'pending',
      requestedBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    dataStore.onboardingRequests.push(request);

    await sendNotificationBundle({
      toEmail: email,
      toPhone: phone,
      subject: 'Tutor onboarding initiated',
      html: `<p>Hi ${name},</p><p>Your KK onboarding has started. We'll notify you once verified.</p>`,
      whatsappMessage: `Hi ${name}, your KK onboarding request is pending verification.`,
    });

    const notifyEmail = process.env.ONBOARDING_NOTIFY_EMAIL || process.env.MAIL_FROM;
    if (notifyEmail) {
      await sendMail({
        to: notifyEmail,
        subject: 'New tutor onboarding request',
        html: `<p>A new tutor onboarding request was submitted.</p>
<ul>
  <li><strong>Name:</strong> ${name}</li>
  <li><strong>Email:</strong> ${email}</li>
  <li><strong>Phone:</strong> ${phone}</li>
</ul>
<p>Requested by user: ${req.user?.email || 'unknown'}</p>`,
      });
    }

    logAction(req.user, 'CREATE_ONBOARDING', `Created onboarding request for ${name}`, 'OnboardingRequest', onboardingRequest.id);

    res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
};

const updateOnboardingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = dataStore.onboardingRequests.find((item) => item.id === id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    request.status = status;
    request.updatedAt = new Date().toISOString();

    await sendNotificationBundle({
      toEmail: request.email,
      toPhone: decrypt(request.phoneEncrypted),
      subject: `Onboarding ${status}`,
      html: `<p>Your onboarding status is now <strong>${status}</strong>.</p>`,
      whatsappMessage: `Your KK onboarding status is now ${status}.`,
    });

    if (status === 'approved') {
      // Create User
      const newUser = {
        id: uuid(),
        name: request.name,
        email: request.email,
        passwordHash: bcrypt.hashSync('tutor@123', 10), // Default password
        role: 'tutor',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}`,
      };
      dataStore.users.push(newUser);

      // Create Tutor Profile
      const newTutor = {
        id: newUser.id,
        name: request.name,
        email: request.email,
        phone: request.phoneEncrypted,
        status: 'active',
        medium: request.medium || null,
        district: request.district || null,
        subjects: request.subjects || [], // Array of subjects
        avgAttendance: 0,
      };
      dataStore.tutors.push(newTutor);

      logAction(req.user, 'APPROVE_ONBOARDING', `Approved onboarding for ${request.name}. User and Tutor profiles created.`, 'OnboardingRequest', id);
    } else {
      logAction(req.user, 'UPDATE_ONBOARDING_STATUS', `Updated onboarding status for ${request.name} to ${status}`, 'OnboardingRequest', id);
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const listOnboarding = (_req, res) => {
  res.json({ requests: dataStore.onboardingRequests });
};

export { createOnboarding, updateOnboardingStatus, listOnboarding };

