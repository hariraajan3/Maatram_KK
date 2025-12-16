const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const dataStore = require('../models/dataStore');
const { encrypt, decrypt } = require('../utils/security');
const { sendNotificationBundle } = require('../utils/notifications');
const { sendMail } = require('../config/email');
const { logAction } = require('../utils/auditLogger');
const bcrypt = require('bcryptjs');

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
    const { name, email, phone, documents } = req.body;
    const request = {
      id: uuid(),
      name,
      email,
      phoneEncrypted: encrypt(phone),
      documents: documents || [],
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

    logAction(req.user, 'CREATE_ONBOARDING', `Created onboarding request for ${name}`);

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
        subjects: [], // To be filled later
        avgAttendance: 0,
      };
      dataStore.tutors.push(newTutor);

      logAction(req.user, 'APPROVE_ONBOARDING', `Approved onboarding for ${request.name}. User and Tutor profiles created.`);
    } else {
      logAction(req.user, 'UPDATE_ONBOARDING_STATUS', `Updated onboarding status for ${request.name} to ${status}`);
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const listOnboarding = (_req, res) => {
  res.json({ requests: dataStore.onboardingRequests });
};

module.exports = {
  createOnboarding,
  updateOnboardingStatus,
  listOnboarding,
};

