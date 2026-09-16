const { getSql } = require('./lfdDb');
// Exemple d'utilisation future de PDFKit : const PDFDocument = require('pdfkit');

/**
 * Fonction d'aide pour générer un PDF avec l'en-tête de l'entreprise
 * Utilisation (lorsque les PDFs seront implémentés) :
 * 
 * const doc = new PDFDocument({ margin: 50 });
 * await addLFDHeader(doc);
 * doc.text("Facture N° XXXXXX", { align: 'center' });
 * ...
 */
async function addLFDHeader(doc) {
  try {
    const settings = await getSql(`SELECT * FROM LFD_Settings WHERE key = 'headerImageBase64'`);
    if (settings && settings.value) {
      // L'image est stockée en data URI (data:image/png;base64,iVBORw0KGgo...)
      // PDFKit nécessite un Buffer ou un chemin de fichier
      const base64Data = settings.value.split(',')[1];
      if (base64Data) {
        const imageBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imageBuffer, 50, 45, { width: 500 });
        doc.moveDown(10); // Ajuster l'espacement après l'en-tête
      }
    }
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'en-tête PDF:", err);
  }
}

module.exports = {
  addLFDHeader
};
