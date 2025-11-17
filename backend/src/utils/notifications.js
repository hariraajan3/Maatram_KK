const axios = require('axios');
const { sendMail } = require('../config/email');

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';

const sendWhatsApp = async ({ to, message }) => {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.info('[WhatsApp mock]', { to, message });
    return;
  }

  await axios({
    method: 'post',
    url: `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    data: {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    },
  });
};

const sendNotificationBundle = async ({ toEmail, toPhone, subject, html, whatsappMessage }) => {
  const tasks = [];
  if (toEmail) {
    tasks.push(sendMail({ to: toEmail, subject, html }));
  }
  if (toPhone) {
    tasks.push(sendWhatsApp({ to: toPhone, message: whatsappMessage || subject }));
  }
  await Promise.all(tasks);
};

module.exports = {
  sendNotificationBundle,
};

