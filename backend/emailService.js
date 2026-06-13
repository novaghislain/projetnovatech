const nodemailer = require('nodemailer');
const db = require('./db');
require('dotenv').config();

const getTransporter = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT smtpUser, smtpPass, smtpHost, smtpPort, siteName FROM GeneralSettings WHERE id = 1", [], (err, settings) => {
      let user = process.env.EMAIL_USER;
      let pass = process.env.EMAIL_PASS;
      let host = 'smtp.gmail.com';
      let port = 465;
      let siteName = 'FormationNova';

      if (!err && settings) {
        if (settings.smtpUser) user = settings.smtpUser;
        if (settings.smtpPass) pass = settings.smtpPass;
        if (settings.smtpHost) host = settings.smtpHost;
        if (settings.smtpPort) port = parseInt(settings.smtpPort, 10);
        if (settings.siteName) siteName = settings.siteName;
      }

      if (!user || !pass) {
        console.warn("Transporter configuration issue: EMAIL_USER or EMAIL_PASS not set in ENV or DB.");
      }

      const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
          user: user,
          pass: pass
        }
      });
      resolve({ transporter, user, siteName });
    });
  });
};

async function sendEmail({ to, subject, html }) {
  try {
    const { transporter, user, siteName } = await getTransporter();
    return transporter.sendMail({
      from: `"${siteName}" <${user}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Erreur lors de la préparation de l'email:", err);
    throw err;
  }
}

module.exports = { sendEmail };
