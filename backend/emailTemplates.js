function enrollmentConfirmation({ firstName, courseTitle, childName, meetLink, whatsappLink }) {
  return {
    subject: `Confirmation d'inscription - ${courseTitle} | FormationNova`,
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">FormationNova</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Formation au numérique pour enfants</p>
        </div>
        <div style="padding:28px 24px;background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e3a5f;margin:0 0 16px">Inscription confirmée</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Votre inscription à la formation <strong>"${courseTitle}"</strong> a bien été prise en compte et validée.</p>
          ${childName ? `<p><strong>Enfant :</strong> ${childName}</p>` : ''}
          
          ${meetLink || whatsappLink ? `
            <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px;border-radius:6px;margin:20px 0;">
              <h3 style="margin:0 0 10px;color:#1e3a5f;font-size:16px;">📚 Liens importants pour le cours en ligne</h3>
              ${meetLink ? `<p style="margin:4px 0;"><strong>Lien Visioconférence (Google Meet/Zoom) :</strong> <a href="${meetLink}" target="_blank" style="color:#2563eb;text-decoration:underline;">Rejoindre la visioconférence</a></p>` : ''}
              ${whatsappLink ? `<p style="margin:4px 0;"><strong>Lien du Groupe WhatsApp :</strong> <a href="${whatsappLink}" target="_blank" style="color:#2563eb;text-decoration:underline;">Rejoindre le groupe WhatsApp</a></p>` : ''}
            </div>
          ` : ''}

          <p>Vous pouvez consulter vos inscriptions et ressources de cours depuis votre espace personnel.</p>
          <a href="http://localhost:5173/mon-espace/formations"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Voir mes inscriptions
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="font-size:13px;color:#94a3b8">FormationNova · Cotonou, Bénin</p>
        </div>
      </div>
    `
  };
}

function paymentReceipt({ firstName, courseTitle, amount, transactionId, paymentMethod }) {
  const formattedAmount = amount ? Number(amount).toLocaleString() + ' FCFA' : '—';
  return {
    subject: `Reçu de paiement - ${courseTitle} | FormationNova`,
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">FormationNova</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Reçu de paiement</p>
        </div>
        <div style="padding:28px 24px;background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e3a5f;margin:0 0 16px">Paiement confirmé</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Nous confirmons la réception de votre paiement pour la formation <strong>"${courseTitle}"</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Montant</td><td style="padding:8px 0;font-weight:600;text-align:right">${formattedAmount}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;border-top:1px solid #e2e8f0">Moyen de paiement</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e2e8f0">${paymentMethod}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;border-top:1px solid #e2e8f0">Transaction</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e2e8f0">${transactionId}</td></tr>
          </table>
          <a href="http://localhost:5173/mon-espace/paiements"
             style="display:inline-block;margin-top:8px;padding:12px 24px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Voir mes paiements
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="font-size:13px;color:#94a3b8">FormationNova · Cotonou, Bénin</p>
        </div>
      </div>
    `
  };
}

function welcomeEmail({ firstName, email, password }) {
  return {
    subject: 'Bienvenue sur FormationNova',
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">FormationNova</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Bienvenue</p>
        </div>
        <div style="padding:28px 24px;background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e3a5f;margin:0 0 16px">Bienvenue chez FormationNova</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Votre compte a été créé avec succès suite à votre inscription à une formation.</p>
          <p>Voici vos identifiants de connexion :</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0;font-weight:600;text-align:right">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;border-top:1px solid #e2e8f0">Mot de passe</td><td style="padding:8px 0;text-align:right;border-top:1px solid #e2e8f0">${password}</td></tr>
          </table>
          <p style="font-size:13px;color:#94a3b8">Nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
          <a href="http://localhost:5173/connexion"
             style="display:inline-block;margin-top:8px;padding:12px 24px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Se connecter
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="font-size:13px;color:#94a3b8">FormationNova · Cotonou, Bénin</p>
        </div>
      </div>
    `
  };
}

function certificateEmail({ firstName, courseTitle, certId }) {
  return {
    subject: `Votre certificat - ${courseTitle} | FormationNova`,
    html: `
      <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;color:#1e293b">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">FormationNova</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px">Certificat de réussite</p>
        </div>
        <div style="padding:28px 24px;background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e3a5f;margin:0 0 16px">Félicitations !</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Vous avez complété la formation <strong>"${courseTitle}"</strong> avec succès.</p>
          <p>Votre certificat est disponible dans votre espace personnel. Vous pouvez le télécharger et le partager.</p>
          <p style="font-size:13px;color:#64748b">ID de vérification : <strong>${certId}</strong></p>
          <a href="http://localhost:5173/mon-espace"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Accéder à mon espace
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
          <p style="font-size:13px;color:#94a3b8">FormationNova · Cotonou, Bénin</p>
        </div>
      </div>
    `
  };
}

module.exports = { enrollmentConfirmation, paymentReceipt, welcomeEmail, certificateEmail };
