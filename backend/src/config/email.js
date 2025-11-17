const nodemailer = require('nodemailer');

const buildTransport = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const transporter = buildTransport();

const sendMail = async ({ to, subject, html }) => {
  const from = process.env.MAIL_FROM || 'noreply@maatram.org';
  await transporter.sendMail({ to, subject, html, from });
};

module.exports = {
  sendMail,
};

