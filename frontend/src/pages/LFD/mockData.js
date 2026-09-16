// mockData.js — Donnees fictives Phase 1 La Foi Distribution
// A remplacer par de vraies API en Phase 2

export const MOCK_KPI = {
  caJour:          2450000,
  caMois:          38750000,
  ventesJour:      47,
  panierMoyen:     52128,
  ventesEncaissees:1850000,
  ventesCredit:    600000,
  caisseInitiale:  500000,
  encaissements:   1850000,
  decaissements:   320000,
  caisseTheorique: 2030000,
  caissePhysique:  1955000,
  ecartCaisse:     -75000,
  creancesTotales: 4850000,
  creancesEchues:  1200000,
  paiementsRecus:  850000,
  clientsRetard:   8,
  valeurStock:     28400000,
  mouvementsJour:  23,
  stockCritique:   3,
  ruptures:        1,
  anomaliesStock:  2,
  depotsBancaires: 5200000,
  depotsAttente:   800000,
  commandesJour:   12,
  commandesPrepa:  4,
  livraisonsJour:  9,
  retours:         1,
};

export const MOCK_SALES_CHART = [
  { jour: "Lun", ventes: 1800000, objectif: 2000000 },
  { jour: "Mar", ventes: 2100000, objectif: 2000000 },
  { jour: "Mer", ventes: 1650000, objectif: 2000000 },
  { jour: "Jeu", ventes: 2450000, objectif: 2000000 },
  { jour: "Ven", ventes: 3100000, objectif: 2000000 },
  { jour: "Sam", ventes: 2800000, objectif: 2000000 },
  { jour: "Dim", ventes: 950000,  objectif: 2000000 },
];

export const MOCK_CASH_CHART = [
  { jour: "Lun", encaissements: 1800000, credit: 420000 },
  { jour: "Mar", encaissements: 1950000, credit: 380000 },
  { jour: "Mer", encaissements: 1500000, credit: 580000 },
  { jour: "Jeu", encaissements: 1850000, credit: 600000 },
  { jour: "Ven", encaissements: 2900000, credit: 720000 },
  { jour: "Sam", encaissements: 2600000, credit: 340000 },
  { jour: "Dim", encaissements: 850000,  credit: 180000 },
];

export const MOCK_MONTHLY_SALES = [
  { mois: "Jan", ca: 28000000 },
  { mois: "Fev", ca: 32000000 },
  { mois: "Mar", ca: 29500000 },
  { mois: "Avr", ca: 35000000 },
  { mois: "Mai", ca: 31000000 },
  { mois: "Jun", ca: 38000000 },
  { mois: "Jul", ca: 36500000 },
  { mois: "Aou", ca: 33000000 },
  { mois: "Sep", ca: 38750000 },
];

export const MOCK_ALERTS = [
  { id:1, level:"critical", label:"Alerte Caisse",    message:"Ecart de caisse detecte : -75 000 FCFA. Verification immediate requise.",  time:"08:22", module:"Caisse" },
  { id:2, level:"critical", label:"Alerte Stock",     message:"Sortie de marchandises sans document associe (Ref: SOT-00421).",            time:"07:55", module:"Stock" },
  { id:3, level:"warning",  label:"Alerte Creance",   message:"Client SODEXCO depasse son plafond de credit de 350 000 FCFA.",             time:"09:10", module:"Creances" },
  { id:4, level:"warning",  label:"Alerte Banque",    message:"Depot bancaire du 13/09 (800 000 FCFA) non rapproche depuis 3 jours.",      time:"08:45", module:"Banque" },
  { id:5, level:"info",     label:"Info Operations",  message:"12 commandes en attente de preparation au depot.",                         time:"09:30", module:"Commandes" },
  { id:6, level:"info",     label:"Info Stock",       message:"3 produits en dessous du seuil critique. Reapprovisionnement recommande.",   time:"10:00", module:"Stock" },
];

export const MOCK_ACTIVITY = [
  { id:1,  time:"10:12", user:"Oki Daniel",   role:"billing_agent",   action:"Facture creee",          ref:"FAC-00192", amount:1250000,  status:"success",  module:"Facturation" },
  { id:2,  time:"09:58", user:"Paulette K.",  role:"cashier",         action:"Encaissement",           ref:"ENC-00318", amount:850000,   status:"success",  module:"Caisse" },
  { id:3,  time:"09:47", user:"Crepin M.",    role:"warehouse_agent", action:"Sortie stock",           ref:"CMD-00251", amount:null,     status:"pending",  module:"Stock" },
  { id:4,  time:"09:31", user:"Oki Daniel",   role:"billing_agent",   action:"Bon de livraison",       ref:"BL-00089",  amount:null,     status:"success",  module:"Livraisons" },
  { id:5,  time:"09:18", user:"Marie C.",     role:"cashier",         action:"Clôture caisse partielle", ref:"CAI-16/09", amount:1955000, status:"success",  module:"Caisse" },
  { id:6,  time:"08:54", user:"Jean P.",      role:"accountant",      action:"Rapprochement banque",   ref:"RAP-00041", amount:null,     status:"pending",  module:"Banque" },
  { id:7,  time:"08:42", user:"Paulette K.",  role:"billing_agent",   action:"Facture creee",          ref:"FAC-00189", amount:850000,   status:"success",  module:"Facturation" },
  { id:8,  time:"08:30", user:"Direction",    role:"director",        action:"Validation commande",    ref:"CMD-00250", amount:3200000,  status:"success",  module:"Commandes" },
];

export const formatFCFA = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);
};

export const formatNumber = (n) => new Intl.NumberFormat("fr-FR").format(n);

export const getLFDDate = () => {
  return new Date().toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
};
