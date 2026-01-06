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

  console.log('[email] Attempting to send email via jsonTransport...');
  const transport = nodemailer.createTransport({
    jsonTransport: true,
  });
  return transport;
};

const transporter = buildTransport();

const sendMail = async ({ to, subject, html, from }) => {
  if (!to) {
    throw new Error('sendMail: "to" is required');
  }

  const fromAddress = from || process.env.MAIL_FROM || 'noreply@maatram.org';

  console.log(`[email] Sending email to: ${to} from: ${fromAddress}`);

  const mailData = {
    to,
    subject,
    html,
    from: fromAddress
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log('[email] Message sent:', info.messageId);
        if (info.response) console.log('[email] SMTP Response:', info.response);
        resolve(info);
      }
    });
  });
};

export { sendMail };
