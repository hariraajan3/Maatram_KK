import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM = 'noreply@maatram.org',
} = process.env;

const buildTransport = () => {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  console.warn('[email] SMTP env not configured; falling back to jsonTransport');
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const transporter = buildTransport();

const sendMail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error('sendMail: "to" is required');
  }
  await transporter.sendMail({ to, subject, html, from: MAIL_FROM });
};

export { sendMail };

