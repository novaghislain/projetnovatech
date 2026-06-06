const PDFDocument = require('pdfkit');

function generateCertificate({ firstName, lastName, email, courseTitle, completionDate, modules, certId }) {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const w = doc.page.width;
  const h = doc.page.height;

  doc.rect(0, 0, w, h).fill('#fefdfb');

  // Cadre
  doc.rect(20, 20, w - 40, h - 40).lineWidth(1.5).stroke('#0F3460');
  doc.rect(26, 26, w - 52, h - 52).lineWidth(0.5).stroke('#b8860b');
  doc.rect(30, 30, w - 60, h - 60).lineWidth(0.3).stroke('#cbd5e1');

  // Bandes haute et basse
  doc.rect(0, 0, w, 6).fill('#0F3460');
  doc.rect(0, 6, w, 2).fill('#b8860b');
  doc.rect(0, h - 8, w, 6).fill('#0F3460');
  doc.rect(0, h - 8, w, 2).fill('#b8860b');

  // Traits verticaux latéraux
  doc.rect(50, 45, 0.5, h - 90).lineWidth(0.2).stroke('#e2e8f0');
  doc.rect(w - 50, 45, 0.5, h - 90).lineWidth(0.2).stroke('#e2e8f0');

  // --- 1. Organisation ---
  doc.fontSize(26).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text('NOVATECH VISION', w / 2, 60, { align: 'center' });

  doc.fontSize(10).fillColor('#0F3460').font('Helvetica');
  doc.text('CENTRE DE FORMATION EN INFORMATIQUE', w / 2, 90, { align: 'center' });
  doc.text('Cotonou, Bénin', w / 2, 105, { align: 'center' });

  // --- 2. Titre du certificat ---
  doc.moveTo(w / 2 - 120, 125).lineTo(w / 2 + 120, 125).lineWidth(0.5).stroke('#b8860b');

  doc.fontSize(22).fillColor('#0F3460').font('Helvetica-Bold');
  doc.text('CERTIFICAT DE RÉUSSITE', w / 2, 148, { align: 'center' });

  // --- 3. Destinataire ---
  doc.fontSize(11).fillColor('#4b5563').font('Helvetica');
  doc.text('Ce certificat est décerné à', w / 2, 183, { align: 'center' });

  const nameY = 208;
  doc.fontSize(11).fillColor('#0F3460').font('Helvetica-Bold');
  doc.text('M./Mme', w / 2, nameY, { align: 'center' });
  doc.fontSize(34).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text(`${firstName} ${lastName}`, w / 2, nameY + 16, { align: 'center' });

  // --- 4. Formation complétée ---
  doc.fontSize(11).fillColor('#4b5563').font('Helvetica');
  doc.text('pour avoir complété avec succès la formation', w / 2, 275, { align: 'center' });

  doc.fontSize(22).fillColor('#0F3460').font('Helvetica-Bold');
  doc.text(courseTitle, w / 2, 300, { align: 'center' });

  // --- 5. Modules (facultatif) ---
  if (modules && modules.length > 0) {
    doc.fontSize(9).fillColor('#6b7280').font('Helvetica-Bold');
    doc.text('Modules complétés', w / 2, 345, { align: 'center' });
    doc.fontSize(8.5).fillColor('#1A1A2E').font('Helvetica');
    const mods = modules.map(m => '  ' + m.title).join('  |');
    doc.text(mods, w / 2, 362, {
      align: 'center',
      width: w - 220,
      lineBreak: true,
    });
  }

  // --- 6. Date de délivrance ---
  const dateY = modules && modules.length > 0 ? 410 : 385;
  doc.fontSize(9).fillColor('#6b7280').font('Helvetica');
  doc.text(`Délivré le ${completionDate}`, w / 2, dateY, { align: 'center' });
  doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica');
  doc.text(email, w / 2, dateY + 14, { align: 'center' });

  // --- 7. Numéro de certificat ---
  doc.fontSize(7).fillColor('#cbd5e1').font('Helvetica');
  doc.text(`Certificat n° ${certId} · Vérifier : www.novatech-vision.bj/verifier/${certId}`, w / 2, dateY + 30, { align: 'center' });

  // --- 8. Signatures ---
  const sigY = h - 95;
  doc.moveTo(w / 2 - 180, sigY).lineTo(w / 2 - 40, sigY).lineWidth(0.5).stroke('#0F3460');
  doc.moveTo(w / 2 + 40, sigY).lineTo(w / 2 + 180, sigY).lineWidth(0.5).stroke('#0F3460');

  doc.fontSize(9).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text('Directeur Pédagogique', w / 2 - 180, sigY + 8, { width: 140, align: 'center' });
  doc.text('Coordonnateur', w / 2 + 40, sigY + 8, { width: 140, align: 'center' });

  doc.fontSize(7).fillColor('#9ca3af').font('Helvetica');
  doc.text('Novatech Vision', w / 2 - 180, sigY + 24, { width: 140, align: 'center' });
  doc.text('Novatech Vision', w / 2 + 40, sigY + 24, { width: 140, align: 'center' });

  // --- Pied ---
  doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica');
  doc.text('Novatech Vision · Cotonou, Bénin', w / 2, h - 45, { align: 'center' });

  return doc;
}

module.exports = { generateCertificate };
