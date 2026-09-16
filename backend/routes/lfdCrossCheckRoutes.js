const express = require('express');
const router = express.Router();
const { getSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');

router.get('/analysis', authenticateLfdToken, requireLfdPermission('report.read'), async (req, res) => {
  try {
    // Analyse 1 : Caisse (Théorique vs Physique vs Dépôts)
    // On prend les sessions de caisse clôturées récemment pour voir les écarts
    const caisseSessions = await allSql(`
      SELECT id, opened_at, closed_at, theoretical_balance, physical_balance as actual_balance, difference, status
      FROM LFD_CashSessions
      ORDER BY id DESC LIMIT 10
    `);

    // Analyse 2 : Ventes vs Facturation
    // Ventes qui n'ont pas de facture liée (s'il y a une relation directe, ou statut)
    // Ici on suppose que le module de Ventes gère le statut PAID
    const ventesVsFactures = await getSql(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total) as total_amount,
        SUM(CASE WHEN payment_type = 'CREDIT' THEN total ELSE 0 END) as credit_sales,
        SUM(CASE WHEN payment_type = 'CASH' THEN total ELSE 0 END) as cash_sales
      FROM LFD_Sales
      WHERE status != 'CANCELLED'
    `);

    // Analyse 3 : Livraisons non complétées (Ventes validées mais pas livrées entièrement)
    const pendingDeliveries = await getSql(`
      SELECT COUNT(*) as cnt FROM LFD_Deliveries WHERE status != 'DELIVERED' AND status != 'CANCELLED'
    `);

    // Analyse 4 : Anomalies détectées automatiquement
    const anomalies = [];
    
    // 4.1 Ecarts de caisse non justifiés (ex: > 0 ou < 0 sans commentaire suffisant)
    const ecarts = caisseSessions.filter(s => s.difference !== 0);
    if (ecarts.length > 0) {
      anomalies.push({
        type: 'CAISSE',
        severity: 'HIGH',
        message: `${ecarts.length} session(s) de caisse avec écart détecté.`,
        details: ecarts.map(e => `Session #${e.id} : Écart de ${e.difference} FCFA`)
      });
    }

    const negativeStocks = await allSql(`
      SELECT 
        p.id, p.name, p.product_code as sku,
        SUM(
          CASE 
            WHEN sm.movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN sm.quantity
            WHEN sm.movement_type IN ('EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT') THEN -sm.quantity
            ELSE 0 
          END
        ) as quantity
      FROM LFD_Products p 
      LEFT JOIN LFD_StockMovements sm ON p.id = sm.product_id 
      GROUP BY p.id
      HAVING quantity < 0
    `);
    if (negativeStocks.length > 0) {
      anomalies.push({
        type: 'STOCK',
        severity: 'CRITICAL',
        message: `${negativeStocks.length} produit(s) en stock négatif.`,
        details: negativeStocks.map(p => `${p.name} (${p.sku}) : ${p.quantity}`)
      });
    }

    // 4.3 Dépôts bancaires non confirmés depuis plus de 48h
    const oldPendingDeposits = await allSql(`
      SELECT id, reference, deposit_date, amount 
      FROM LFD_BankDeposits 
      WHERE status = 'PENDING' AND deposit_date < date('now', '-2 days')
    `);
    if (oldPendingDeposits.length > 0) {
      anomalies.push({
        type: 'BANQUE',
        severity: 'HIGH',
        message: `${oldPendingDeposits.length} dépôt(s) bancaire(s) en attente depuis plus de 48h.`,
        details: oldPendingDeposits.map(d => `Réf ${d.reference} : ${d.amount} FCFA (du ${d.deposit_date})`)
      });
    }

    res.json({
      caisseSessions,
      ventes: ventesVsFactures,
      pendingDeliveries: pendingDeliveries.cnt,
      anomalies
    });

  } catch (error) {
    console.error('[LFD CROSS CHECK] Erreur /analysis:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
