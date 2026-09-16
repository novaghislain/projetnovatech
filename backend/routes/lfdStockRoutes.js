const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');
const crypto = require('crypto');

// Calculer le stock actuel pour chaque produit
router.get('/', authenticateLfdToken, requireLfdPermission('stock.read'), async (req, res) => {
  try {
    // Calcul = SUM(quantités entrées) - SUM(quantités sorties) groupées par produit et par dépôt
    // ENTRY, TRANSFER_IN, ADJUSTMENT_IN, RETURN (positif)
    // EXIT, TRANSFER_OUT, ADJUSTMENT_OUT (négatif)
    const stockQuery = `
      SELECT 
        p.id as product_id,
        p.product_code,
        p.name as product_name,
        p.minimum_stock,
        w.id as warehouse_id,
        w.name as warehouse_name,
        SUM(
          CASE 
            WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity
            WHEN movement_type IN ('EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT') THEN -quantity
            ELSE 0 
          END
        ) as current_quantity
      FROM LFD_Products p
      LEFT JOIN LFD_StockMovements sm ON p.id = sm.product_id
      LEFT JOIN LFD_Warehouses w ON sm.warehouse_id = w.id
      WHERE p.status != 'DELETED'
      GROUP BY p.id, w.id
    `;
    const stock = await allSql(stockQuery);
    res.json(stock);
  } catch (error) {
    console.error('[LFD STOCK] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks.' });
  }
});

// Récupérer l'historique des mouvements
router.get('/movements', authenticateLfdToken, requireLfdPermission('stock.read'), async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const movements = await allSql(`
      SELECT sm.*, p.name as product_name, w.name as warehouse_name, e.firstName, e.lastName 
      FROM LFD_StockMovements sm
      JOIN LFD_Products p ON sm.product_id = p.id
      JOIN LFD_Warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN LFD_Employees e ON sm.created_by = e.id
      ORDER BY sm.id DESC
      LIMIT ?
    `, [limit]);
    res.json(movements);
  } catch (error) {
    console.error('[LFD STOCK] Erreur GET /movements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des mouvements.' });
  }
});

// Enregistrer un nouveau mouvement de stock
router.post('/movements', authenticateLfdToken, async (req, res) => {
  const { product_id, warehouse_id, movement_type, quantity, reason } = req.body;

  // Validation
  if (!product_id || !warehouse_id || !movement_type || !quantity) {
    return res.status(400).json({ error: 'Données de mouvement incomplètes.' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ error: 'La quantité doit être supérieure à zéro.' });
  }

  // Vérifier les permissions en fonction du type de mouvement
  const roleCode = req.user.role; // Attention : req.user.role dans le JWT contient l'ID du role.
  
  // Utilisons getSql pour avoir le code du role si req.user.role est un ID
  const roleRow = await getSql(`SELECT code FROM LFD_Roles WHERE id = ?`, [req.user.role]);
  const roleStr = roleRow ? roleRow.code : '';

  // Simulation basique du RBAC pour cet endpoint dynamique (normalement géré par le middleware, 
  // mais le middleware requireLfdPermission est statique par endpoint. Ici, ça dépend du body).
  const isSuperAdminOrDirector = roleStr === 'SUPER_ADMIN' || roleStr === 'DIRECTOR';
  const isWarehouseAgent = roleStr === 'WAREHOUSE_AGENT';

  if (movement_type.includes('ADJUSTMENT') && !isSuperAdminOrDirector) {
    return res.status(403).json({ error: 'Seule la direction peut faire des ajustements d\'inventaire.' });
  }

  try {
    const product = await getSql(`SELECT id FROM LFD_Products WHERE id = ?`, [product_id]);
    if (!product) return res.status(400).json({ error: 'Produit introuvable.' });

    const warehouse = await getSql(`SELECT id FROM LFD_Warehouses WHERE id = ?`, [warehouse_id]);
    if (!warehouse) return res.status(400).json({ error: 'Dépôt introuvable.' });

    // Si c'est une sortie, vérifier si le stock est suffisant
    if (['EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT'].includes(movement_type)) {
      const currentStockRow = await getSql(`
        SELECT SUM(
          CASE 
            WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity
            WHEN movement_type IN ('EXIT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT') THEN -quantity
            ELSE 0 
          END
        ) as current
        FROM LFD_StockMovements
        WHERE product_id = ? AND warehouse_id = ?
      `, [product_id, warehouse_id]);

      const current = currentStockRow.current || 0;
      if (current < quantity) {
        return res.status(400).json({ error: 'Stock insuffisant pour cette opération.' });
      }
    }

    const reference = `MVT-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    await runSql(`
      INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, reason, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [reference, product_id, warehouse_id, movement_type, quantity, reason || '', req.user.id]);

    const newMovement = await getSql(`SELECT * FROM LFD_StockMovements WHERE reference = ?`, [reference]);

    await logLfdAudit(req.user.id, 'CREATE', 'LFD_StockMovements', newMovement.id, null, newMovement, 'Mouvement de stock: ' + movement_type, req.ip);

    res.status(201).json(newMovement);
  } catch (error) {
    console.error('[LFD STOCK] Erreur POST /movements:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du mouvement.' });
  }
});

module.exports = router;
