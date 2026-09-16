import { jsPDF } from "jspdf";

export const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return "0 FCFA";
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

export const downloadLfdPdf = (type, data) => {
  try {
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [30, 58, 138]; // lfd-surface
    const accentColor = [13, 148, 136]; // lfd-accent
    const dimColor = [100, 116, 139]; // lfd-text-dim

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("LA FOI DISTRIBUTION", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(dimColor[0], dimColor[1], dimColor[2]);
    
    if (type === 'SALE') {
      doc.text(`Facture de Vente N° ${data.sale_number}`, 105, 30, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date : ${data.created_at ? new Date(data.created_at).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}`, 20, 50);
      doc.text(`Type de paiement : ${data.payment_type}`, 20, 60);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Total : ${formatFCFA(data.total)}`, 190, 80, { align: "right" });
      
    } else if (type === 'PURCHASE_ORDER') {
      doc.text(`Commande d'Achat N° ${data.purchase_order_number || data.id}`, 105, 30, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date : ${data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR') : '-'}`, 20, 50);
      doc.text(`Fournisseur : ${data.supplier_name || 'N/A'}`, 20, 60);
      doc.text(`Statut : ${data.status || 'N/A'}`, 20, 70);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Montant : ${formatFCFA(data.total_amount)}`, 190, 90, { align: "right" });
      
    } else if (type === 'SUPPLIER_INVOICE') {
      doc.text(`Facture Fournisseur N° ${data.invoice_number || data.id}`, 105, 30, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Réf. Fournisseur : ${data.supplier_reference || 'N/A'}`, 20, 50);
      doc.text(`Fournisseur : ${data.supplier_name || 'N/A'}`, 20, 60);
      doc.text(`Date de Facture : ${data.invoice_date ? new Date(data.invoice_date).toLocaleDateString('fr-FR') : '-'}`, 20, 70);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Montant TTC : ${formatFCFA(data.total_amount)}`, 190, 90, { align: "right" });
      
    } else if (type === 'SUPPLIER') {
      doc.text(`Fiche Fournisseur N° FRN-${data.id.toString().padStart(4, '0')}`, 105, 30, { align: "center" });
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nom : ${data.name || 'N/A'}`, 20, 50);
      doc.text(`Contact : ${data.contact_name || '-'}`, 20, 60);
      doc.text(`Téléphone : ${data.phone || '-'}`, 20, 70);
      doc.text(`Email : ${data.email || '-'}`, 20, 80);
      doc.text(`Statut : ${data.is_active ? 'ACTIF' : 'INACTIF'}`, 20, 90);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`Dette Actuelle : ${formatFCFA(data.total_debt)}`, 190, 110, { align: "right" });
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(dimColor[0], dimColor[1], dimColor[2]);
    doc.text("Document généré automatiquement par La Foi Distribution", 105, 280, { align: "center" });
    
    // Open in new tab/download
    doc.save(`${type}_${data.id || Date.now()}.pdf`);
    return { success: true };
  } catch (err) {
    console.error("Erreur génération PDF:", err);
    return { success: false, error: err.message };
  }
};
