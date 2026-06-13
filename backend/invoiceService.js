const PDFDocument = require('pdfkit');

const generateInvoice = (enrollment, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  // En-tête
  doc.fontSize(20).fillColor('#1A1A2E').text('FormationNova', { align: 'left' });
  doc.fontSize(10).fillColor('#666666').text('L\'école du numérique de 8 à 18 ans', { align: 'left' });
  doc.text('Cotonou, Bénin', { align: 'left' });
  doc.text('Tél : +229 0191348557', { align: 'left' });

  // Titre Facture
  doc.moveDown(2);
  doc.fontSize(16).fillColor('#D4A017').text('FACTURE / REÇU DE PAIEMENT', { align: 'center', underline: true });
  doc.moveDown(1);

  // Informations de la transaction
  doc.fontSize(12).fillColor('#1A1A2E');
  doc.text(`ID Transaction : ${enrollment.transactionId || 'N/A'}`);
  doc.text(`Date : ${new Date(enrollment.createdAt).toLocaleDateString('fr-FR')}`);
  doc.text(`Statut : ${enrollment.status === 'active' ? 'Validé' : enrollment.status}`);
  doc.moveDown(1);

  // Informations du client
  doc.text(`Client : ${enrollment.parentName || enrollment.firstName + ' ' + enrollment.lastName}`);
  if (enrollment.parentEmail || enrollment.email) {
    doc.text(`Email : ${enrollment.parentEmail || enrollment.email}`);
  }
  if (enrollment.childFirstName) {
    doc.text(`Apprenant inscrit : ${enrollment.childFirstName} ${enrollment.childLastName || ''}`);
  }
  doc.moveDown(2);

  // Ligne de détail
  doc.rect(50, doc.y, 500, 20).fill('#0F3460');
  doc.fillColor('#FFFFFF').fontSize(10);
  doc.text('Désignation', 60, doc.y + 5, { width: 250 });
  doc.text('Total', 450, doc.y, { width: 90, align: 'right' });
  
  doc.moveDown(1);
  doc.fillColor('#1A1A2E').fontSize(12);
  doc.text(`Formation : ${enrollment.courseTitle}`, 60, doc.y + 5, { width: 350 });
  
  doc.text(`${enrollment.totalAmount || enrollment.amount} FCFA`, 450, doc.y, { width: 90, align: 'right' });
  
  doc.moveDown(2);
  
  // Totaux
  const total = enrollment.totalAmount || enrollment.amount;
  const paye = enrollment.amountPaid || enrollment.amount;
  const reste = total - paye;

  doc.text(`Total de la formation : ${total} FCFA`, { align: 'right' });
  doc.text(`Montant payé : ${paye} FCFA`, { align: 'right' });
  if (reste > 0) {
    doc.fillColor('#E94560').text(`Reste à payer : ${reste} FCFA`, { align: 'right' });
  } else {
    doc.fillColor('#10b981').text(`Reste à payer : 0 FCFA (Soldé)`, { align: 'right' });
  }

  // Pied de page
  doc.moveDown(4);
  doc.fillColor('#666666').fontSize(10).text('Merci de votre confiance.', { align: 'center' });
  doc.text('Ceci est un reçu électronique généré automatiquement et faisant office de preuve de paiement.', { align: 'center' });

  doc.end();
};

module.exports = { generateInvoice };
