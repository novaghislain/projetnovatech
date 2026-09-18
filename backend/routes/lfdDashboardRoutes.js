const express = require('express');
const router = express.Router();
const { getSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');

router.get('/kpi', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    // 1. Chiffre d'affaires (Somme des ventes non annulées et non brouillon)
    const caRow = await getSql(`SELECT SUM(total) as ca FROM LFD_Sales WHERE status IN ('VALIDATED', 'PARTIALLY_PAID', 'PAID')`);
    
    // 2. Clients actifs
    const clientsRow = await getSql(`SELECT COUNT(*) as count FROM LFD_Customers WHERE status = 'ACTIVE'`);
    
    // 3. Valeur du stock (Quantité restante * prix d'achat)
    // C'est une requête un peu complexe. On va simplifier en disant qu'on a juste besoin d'une approximation
    // Pour simplifier, on prend juste la somme des entrées - sorties
    const stockRow = await getSql(`
      SELECT SUM(
        (SELECT selling_price FROM LFD_Products WHERE id = sm.product_id) * 
        (CASE WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity 
              WHEN movement_type IN ('EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT') THEN -quantity 
              ELSE 0 END)
      ) as stock_value
      FROM LFD_StockMovements sm
    `);

    // 4. Créances clients
    const creancesRow = await getSql(`SELECT SUM(remaining_amount) as debt FROM LFD_Receivables WHERE status != 'PAID' AND status != 'CANCELLED'`);

    // 5. Dettes Fournisseurs (Nouveau Phase 5A)
    const dettesRow = await getSql(`SELECT SUM(amount - amount_paid) as payables FROM LFD_Payables WHERE status != 'PAID' AND status != 'CANCELLED'`);

    res.json({
      chiffreAffaires: caRow.ca || 0,
      clientsActifs: clientsRow.count || 0,
      valeurStock: stockRow.stock_value || 0,
      creancesClients: creancesRow.debt || 0,
      dettesFournisseurs: dettesRow.payables || 0
    });
  } catch (error) {
    console.error('[LFD DASHBOARD] Erreur GET /kpi:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.get('/cockpit', authenticateLfdToken, requireLfdPermission('direction.read'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Exécution de toutes les requêtes en parallèle pour améliorer les performances
    const [
      ventesToday, ventesMonth, ventesCash, ventesCredit, facturesAnnulees,
      encaissementsToday, encaissementsMonth,
      creances, caisseActive,
      achatsMonth, dettesTotal,
      depotsPending, depotsConfirmed,
      alertesActive
    ] = await Promise.all([
      getSql(`SELECT SUM(total) as ca FROM LFD_Sales WHERE status IN ('VALIDATED', 'PARTIALLY_PAID', 'PAID', 'DELIVERED') AND date(createdAt) = ?`, [today]),
      getSql(`SELECT SUM(total) as ca FROM LFD_Sales WHERE status IN ('VALIDATED', 'PARTIALLY_PAID', 'PAID', 'DELIVERED') AND date(createdAt) >= ?`, [firstDayOfMonth]),
      getSql(`SELECT SUM(total) as ca FROM LFD_Sales WHERE status IN ('VALIDATED', 'PARTIALLY_PAID', 'PAID', 'DELIVERED') AND payment_type = 'CASH'`),
      getSql(`SELECT SUM(total) as ca FROM LFD_Sales WHERE status IN ('VALIDATED', 'PARTIALLY_PAID', 'PAID', 'DELIVERED') AND payment_type = 'CREDIT'`),
      getSql(`SELECT COUNT(*) as cnt FROM LFD_Sales WHERE status = 'CANCELLED'`),
      
      getSql(`SELECT SUM(amount) as total FROM LFD_Payments WHERE date(paid_at) = ?`, [today]),
      getSql(`SELECT SUM(amount) as total FROM LFD_Payments WHERE date(paid_at) >= ?`, [firstDayOfMonth]),
      
      getSql(`SELECT SUM(remaining_amount) as total FROM LFD_Receivables WHERE status != 'PAID' AND status != 'CANCELLED'`),
      
      getSql(`SELECT SUM(theoretical_balance) as total FROM LFD_CashSessions WHERE status = 'OPEN'`),
      
      getSql(`SELECT SUM(total) as total FROM LFD_PurchaseOrders WHERE status != 'CANCELLED' AND date(order_date) >= ?`, [firstDayOfMonth]),
      getSql(`SELECT SUM(remaining_amount) as total FROM LFD_Payables WHERE status != 'PAID' AND status != 'CANCELLED'`),
      
      getSql(`SELECT SUM(amount) as total FROM LFD_BankDeposits WHERE status = 'PENDING'`),
      getSql(`SELECT SUM(amount) as total FROM LFD_BankDeposits WHERE status = 'CONFIRMED' AND date(confirmed_at) = ?`, [today]),
      
      getSql(`SELECT COUNT(*) as cnt FROM LFD_Alerts WHERE status = 'NEW'`)
    ]);

    res.json({
      ventes: {
        today: ventesToday?.ca || 0,
        month: ventesMonth?.ca || 0,
        cash: ventesCash?.ca || 0,
        credit: ventesCredit?.ca || 0,
        cancelledCount: facturesAnnulees?.cnt || 0
      },
      encaissements: {
        today: encaissementsToday?.total || 0,
        month: encaissementsMonth?.total || 0
      },
      creances: creances?.total || 0,
      caisse_active: caisseActive?.total || 0,
      achats: {
        month: achatsMonth?.total || 0,
        dettes: dettesTotal?.total || 0
      },
      depots: {
        pending: depotsPending?.total || 0,
        confirmedToday: depotsConfirmed?.total || 0
      },
      alertesCount: alertesActive?.cnt || 0
    });

  } catch (error) {
    console.error('[LFD DASHBOARD] Erreur GET /cockpit:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
