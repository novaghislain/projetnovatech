export const MOCK_VENTES = [
  { id: "V-001", date: "2026-09-16T08:42:00Z", client: "Client Comptoir 1", montant: 250000, statut: "Paye", articles: 3 },
  { id: "V-002", date: "2026-09-16T09:15:00Z", client: "Supermarché Horizon", montant: 1200000, statut: "A credit", articles: 12 },
  { id: "V-003", date: "2026-09-16T10:05:00Z", client: "Client Comptoir 2", montant: 45000, statut: "Paye", articles: 1 },
];

export const MOCK_FACTURES = [
  { id: "FAC-2026-089", date: "2026-09-15", client: "Boutique Le Soleil", montant: 3500000, statut: "Payee", echeance: "2026-09-30" },
  { id: "FAC-2026-090", date: "2026-09-15", client: "Supermarché Horizon", montant: 1200000, statut: "Brouillon", echeance: "2026-10-15" },
  { id: "FAC-2026-091", date: "2026-09-16", client: "Restaurant La Paix", montant: 850000, statut: "En attente", echeance: "2026-10-16" },
];

export const formatFCFA = (value) => {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(value);
};

export const MOCK_CAISSE = [
  { id: "TRX-001", heure: "08:30", motif: "Ouverture de caisse", type: "Entrée", montant: 50000, operateur: "Caissier 1" },
  { id: "TRX-002", heure: "09:15", motif: "Vente comptoir V-002", type: "Entrée", montant: 15000, operateur: "Caissier 1" },
  { id: "TRX-003", heure: "10:00", motif: "Achat petites fournitures", type: "Sortie", montant: 5000, operateur: "Caissier 1" },
  { id: "TRX-004", heure: "11:30", motif: "Paiement facture FAC-085", type: "Entrée", montant: 120000, operateur: "Caissier 1" },
];

export const MOCK_BANQUE = [
  { id: "B-001", date: "2026-09-15", libelle: "Virement Client Boutique Le Soleil", type: "Crédit", montant: 1500000, statut: "Validé" },
  { id: "B-002", date: "2026-09-15", libelle: "Frais bancaires mensuels", type: "Débit", montant: 12500, statut: "Validé" },
  { id: "B-003", date: "2026-09-16", libelle: "Dépôt espèces Caisse Centrale", type: "Crédit", montant: 850000, statut: "En attente" },
];

export const MOCK_STOCK = [
  { sku: "PRD-001", nom: "Pack Eau Minérale 1.5L x6", categorie: "Boissons", prix: 1500, quantite: 150, seuil: 50 },
  { sku: "PRD-002", nom: "Riz Parfumé 5kg", categorie: "Alimentaire", prix: 4500, quantite: 12, seuil: 20 },
  { sku: "PRD-003", nom: "Savon de Marseille", categorie: "Entretien", prix: 800, quantite: 0, seuil: 100 },
];

export const MOCK_COMMANDES = [
  { id: "CMD-2026-101", date: "2026-09-10", fournisseur: "Grossiste Import SA", montant: 2500000, statut: "Envoyée" },
  { id: "CMD-2026-102", date: "2026-09-12", fournisseur: "Agro Industrie Locale", montant: 850000, statut: "Reçue" },
  { id: "CMD-2026-103", date: "2026-09-15", fournisseur: "Brasserie Nationale", montant: 3200000, statut: "Partielle" },
];

export const MOCK_LIVRAISONS = [
  { id: "LIV-2026-088", facture: "FAC-2026-089", client: "Boutique Le Soleil", chauffeur: "Oki Daniel", statut: "En transit" },
  { id: "LIV-2026-089", facture: "V-002", client: "Supermarché Horizon", chauffeur: "Paulette", statut: "Livré" },
  { id: "LIV-2026-090", facture: "FAC-2026-090", client: "Restaurant La Paix", chauffeur: "-", statut: "En attente" },
];

export const MOCK_ALERTES = [
  { id: "ALT-01", type: "Stock", message: "Le produit Savon de Marseille est en rupture de stock.", gravite: "Critique", date: "Il y a 2h" },
  { id: "ALT-02", type: "Paiement", message: "Retard de paiement détecté pour Supermarché Horizon (32j).", gravite: "Élevée", date: "Hier" },
  { id: "ALT-03", type: "Caisse", message: "Écart de 5000 FCFA lors de la dernière clôture.", gravite: "Moyenne", date: "14 Sept" },
];

export const MOCK_EMPLOYES = [
  { id: "EMP-001", nom: "Oki Daniel", poste: "Chauffeur / Livreur", contact: "01 02 03 04", statut: "Actif" },
  { id: "EMP-002", nom: "Kouassi Marie", poste: "Caissière Principale", contact: "05 06 07 08", statut: "Actif" },
  { id: "EMP-003", nom: "Diallo Oumar", poste: "Responsable Stock", contact: "09 10 11 12", statut: "En congé" },
];

export const MOCK_AUDIT = [
  { id: "AUD-1502", action: "Modification prix", detail: "Changement prix PRD-002 de 4000 à 4500", utilisateur: "Admin (Ghislain)", date: "16/09/2026 10:15" },
  { id: "AUD-1501", action: "Annulation Vente", detail: "Annulation de la vente V-001 (Doublon)", utilisateur: "Kouassi Marie", date: "16/09/2026 09:30" },
  { id: "AUD-1500", action: "Connexion", detail: "Connexion réussie", utilisateur: "Oki Daniel", date: "16/09/2026 08:00" },
];

export const MOCK_CLIENTS = [
  { id: "CL-001", nom: "Boutique Serigne Fallou", type: "Gros", contact: "77 123 45 67", email: "contact@bsf.sn", totalAchats: 1250000, soldeDu: 450000 },
  { id: "CL-002", nom: "Awa Ndiaye", type: "Détail", contact: "76 987 65 43", email: "awa.ndiaye@gmail.com", totalAchats: 35000, soldeDu: 0 }
];

export const MOCK_CREANCES = [
  { id: "CR-001", facture: "FAC-2026-001", client: "Boutique Serigne Fallou", montant: 450000, echeance: "10/09/2026", statut: "En retard", joursRetard: 6 }
];
