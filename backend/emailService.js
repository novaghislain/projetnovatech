const nodemailer = require('nodemailer');
const db = require('./db');
require('dotenv').config();

function getTransporterAndFrom() {
  return new Promise((resolve, reject) => {
    db.get("SELECT smtpUser, smtpPass, siteName, contactEmail FROM GeneralSettings WHERE id = 1", [], (err, row) => {
      let user = process.env.EMAIL_USER;
      let pass = process.env.EMAIL_PASS;
      let siteName = 'FormationNova';
      
      if (!err && row) {
        if (row.smtpUser && row.smtpPass) {
          user = row.smtpUser;
          pass = row.smtpPass;
        }
        if (row.siteName) siteName = row.siteName;
      }
      
      if (!user || !pass) {
        return reject(new Error("Email credentials not configured in DB or .env"));
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      resolve({ transporter, user, siteName });
    });
  });
}

async function sendEmail({ to, subject, html }) {
  try {
    const { transporter, user, siteName } = await getTransporterAndFrom();
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
