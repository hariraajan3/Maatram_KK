const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const dataStore = require('../models/dataStore');
const { encrypt, decrypt } = require('../utils/security');
const { sendNotificationBundle } = require('../utils/notifications');

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

