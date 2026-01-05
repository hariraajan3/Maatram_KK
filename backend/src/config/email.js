import nodemailer from 'nodemailer';

const buildTransport = () => {
  // Check for required env vars
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;

    const isSecure = port === 465;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  console.warn('[email] SMTP env not configured; falling back to jsonTransport');
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const transporter = buildTransport();

const sendMail = async ({ to, subject, html, from }) => {
  if (!to) {
    throw new Error('sendMail: "to" is required');
  }
  await transporter.sendMail({
      to,
      subject,
      html,
    from: process.env.MAIL_FROM 
  });
};

export { sendMail };

