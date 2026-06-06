const PDFDocument = require('pdfkit');

function generateCertificate({ firstName, lastName, email, courseTitle, completionDate, modules, certId }) {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const w = doc.page.width;
  const h = doc.page.height;

  // --- Background ---
  doc.rect(0, 0, w, h).fill('#ffffff');

  // --- Top navy band ---
  doc.rect(0, 0, w, 14).fill('#1A1A2E');
  doc.rect(0, 14, w, 2).fill('#d4a017');

  // --- Bottom navy band ---
  doc.rect(0, h - 14, w, 14).fill('#1A1A2E');
  doc.rect(0, h - 16, w, 2).fill('#d4a017');

  // --- Outer border ---
  doc.rect(16, 16, w - 32, h - 32).lineWidth(1).stroke('#1A1A2E');
  doc.rect(20, 20, w - 40, h - 40).lineWidth(0.3).stroke('#d4a017');

  // --- Left gold accent line ---
  doc.rect(50, 50, 2, h - 100).fill('#d4a017');

  // ──────────────────────────────────────────────
  // HEADER
  // ──────────────────────────────────────────────

  doc.fontSize(24).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text('NOVATECH VISION', 75, 55);

  doc.fontSize(9).fillColor('#64748b').font('Helvetica');
  doc.text('CENTRE DE FORMATION EN INFORMATIQUE', 75, 82);
  doc.text('Cotonou, Bénin', 75, 94);

  // Separator line
  doc.moveTo(75, 112).lineTo(w - 50, 112).lineWidth(0.3).stroke('#e2e8f0');

  // ──────────────────────────────────────────────
  // CERTIFICATE TITLE
  // ──────────────────────────────────────────────

  doc.fontSize(11).fillColor('#64748b').font('Helvetica');
  doc.text('Ce certificat est décerné à', 75, 148);

  doc.fontSize(36).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text(`${firstName} ${lastName}`, 75, 172);

  doc.fontSize(11).fillColor('#475569').font('Helvetica');
  doc.text('pour avoir complété avec succès la formation', 75, 228);

  doc.fontSize(20).fillColor('#0F3460').font('Helvetica-Bold');
  doc.text(courseTitle, 75, 255);

  doc.fontSize(8).fillColor('#94a3b8').font('Helvetica');
  doc.text('une formation en ligne non créditée', 75, 285);
  doc.text('autorisée par Novatech Vision', 75, 297);

  // ──────────────────────────────────────────────
  // MODULES
  // ──────────────────────────────────────────────

  if (modules && modules.length > 0) {
    const modY = 335;
    doc.fontSize(8).fillColor('#0F3460').font('Helvetica-Bold');
    doc.text('Modules complétés', 75, modY);

    doc.fontSize(7.5).fillColor('#334155').font('Helvetica');
    let lineY = modY + 14;
    let line = '';
    for (const m of modules) {
      const test = line ? line + '  ·  ' + m.title : m.title;
      if (doc.widthOfString(test) < w - 130) {
        line = test;
      } else {
        doc.text(line, 75, lineY, { width: w - 130, align: 'left' });
        lineY += 11;
        line = m.title;
      }
    }
    if (line) doc.text(line, 75, lineY, { width: w - 130, align: 'left' });
  }

  // ──────────────────────────────────────────────
  // SIGNATURES
  // ──────────────────────────────────────────────

  const sigY = h - 105;

  const sigLeftX = 75;
  const sigRightX = w / 2 + 40;

  doc.moveTo(sigLeftX, sigY).lineTo(sigLeftX + 180, sigY).lineWidth(0.5).stroke('#1A1A2E');
  doc.moveTo(sigRightX, sigY).lineTo(sigRightX + 180, sigY).lineWidth(0.5).stroke('#1A1A2E');

  doc.fontSize(9).fillColor('#1A1A2E').font('Helvetica-Bold');
  doc.text('Directeur Pédagogique', sigLeftX, sigY + 8, { width: 180, align: 'left' });
  doc.text('Coordonnateur', sigRightX, sigY + 8, { width: 180, align: 'left' });

  doc.fontSize(7).fillColor('#64748b').font('Helvetica');
  doc.text('Novatech Vision', sigLeftX, sigY + 22, { width: 180, align: 'left' });
  doc.text('Novatech Vision', sigRightX, sigY + 22, { width: 180, align: 'left' });

  // ──────────────────────────────────────────────
  // METADATA (right side, aligned with signatures)
  // ──────────────────────────────────────────────

  const metaX = w - 220;
  doc.fontSize(7).fillColor('#64748b').font('Helvetica');
  doc.text(`Date d'émission : ${completionDate}`, metaX, sigY, { align: 'right' });
  doc.text(`Email : ${email}`, metaX, sigY + 12, { align: 'right' });
  doc.text(`N° certificat : ${certId}`, metaX, sigY + 24, { align: 'right' });

  // ──────────────────────────────────────────────
  // VERIFICATION FOOTER
  // ──────────────────────────────────────────────

  doc.fontSize(6.5).fillColor('#94a3b8').font('Helvetica');
  doc.text(
    `Vérifier : www.novatech-vision.bj/verifier/${certId}`,
    w / 2, h - 45, { align: 'center' }
  );

  doc.fontSize(6.5).fillColor('#94a3b8').font('Helvetica');
  doc.text(
    'Novatech Vision · Cotonou, Bénin',
    w / 2, h - 35, { align: 'center' }
  );

  return doc;
}

module.exports = { generateCertificate };
