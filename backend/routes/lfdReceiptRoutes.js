const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission } = require('../middlewares/lfdAuth');
const { runTransaction } = require('../utils/lfdTransaction');
const { logLfdAudit } = require('../middlewares/lfdAuth');

// 1. Enregistrer une réception fournisseur (Goods Receipt)
router.post('/', authenticateLfdToken, requireLfdPermission('receipt.create'), async (req, res) => {
  const { purchase_order_id, warehouse_id, items } = req.body;
  if (!purchase_order_id || !warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Commande, dépôt et articles requis.' });
  }

  try {
    const order = await getSql(`SELECT * FROM LFD_PurchaseOrders WHERE id = ?`, [purchase_order_id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
    if (order.status !== 'APPROVED' && order.status !== 'ORDERED' && order.status !== 'PARTIALLY_RECEIVED') {
      return res.status(400).json({ error: 'La commande n\'est pas dans un état permettant la réception.' });
    }

    const warehouse = await getSql(`SELECT id FROM LFD_Warehouses WHERE id = ?`, [warehouse_id]);
    if (!warehouse) return res.status(404).json({ error: 'Dépôt introuvable.' });

    const receiptNumber = `REC-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    
    // Vérifier les quantités (Pas de sur-réception)
    const orderItems = await allSql(`SELECT * FROM LFD_PurchaseOrderItems WHERE purchase_order_id = ?`, [order.id]);
    const receivedSoFarRows = await allSql(`
      SELECT purchase_order_item_id, SUM(quantity_received) as already_received
      FROM LFD_GoodsReceiptItems gri
      JOIN LFD_GoodsReceipts gr ON gri.goods_receipt_id = gr.id
      WHERE gr.purchase_order_id = ?
      GROUP BY purchase_order_item_id
    `, [order.id]);

    const receivedMap = {};
    for (let row of receivedSoFarRows) receivedMap[row.purchase_order_item_id] = row.already_received;

    for (let item of items) {
      const oItem = orderItems.find(oi => oi.id === item.purchase_order_item_id);
      if (!oItem) return res.status(400).json({ error: `Article de commande ${item.purchase_order_item_id} introuvable.` });
      
      const already = receivedMap[oItem.id] || 0;
      if ((already + item.quantity_received) > oItem.quantity) {
        return res.status(400).json({ error: `Sur-réception interdite pour le produit ID ${oItem.product_id}.` });
      }
    }

    await runTransaction(async () => {
      // Créer la réception
      await runSql(`
        INSERT INTO LFD_GoodsReceipts (receipt_number, purchase_order_id, supplier_id, warehouse_id, received_by)
        VALUES (?, ?, ?, ?, ?)
      `, [receiptNumber, order.id, order.supplier_id, warehouse_id, req.user.id]);

      const receipt = await getSql(`SELECT id FROM LFD_GoodsReceipts WHERE receipt_number = ?`, [receiptNumber]);

      let isFullyReceived = true;

      for (let oItem of orderItems) {
        const inputItem = items.find(i => i.purchase_order_item_id === oItem.id);
        const qtyToReceive = inputItem ? inputItem.quantity_received : 0;
        const alreadyReceived = receivedMap[oItem.id] || 0;
        const totalReceived = alreadyReceived + qtyToReceive;

        if (totalReceived < oItem.quantity) {
          isFullyReceived = false;
        }

        if (qtyToReceive > 0) {
          await runSql(`
            INSERT INTO LFD_GoodsReceiptItems (goods_receipt_id, purchase_order_item_id, product_id, quantity_received, unit_cost)
            VALUES (?, ?, ?, ?, ?)
          `, [receipt.id, oItem.id, oItem.product_id, qtyToReceive, oItem.unit_cost]);

          // Entrée en stock
          const movRef = `MVT-IN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          await runSql(`
            INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
            VALUES (?, ?, ?, 'ENTRY', ?, 'GOODS_RECEIPT', ?, ?, ?)
          `, [movRef, oItem.product_id, warehouse_id, qtyToReceive, receipt.id, 'Réception Fournisseur ' + receiptNumber, req.user.id]);
        }
      }

      const nextStatus = isFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
      await runSql(`UPDATE LFD_PurchaseOrders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [nextStatus, order.id]);

      await logLfdAudit(req.user.id, 'CREATE', 'LFD_GoodsReceipts', receipt.id, null, { receipt_number: receiptNumber }, 'Réception Fournisseur', req.ip);
    });

    res.status(201).json({ success: true, receipt_number: receiptNumber });

  } catch (error) {
    console.error('[LFD RECEIPTS] Erreur POST /:', error);
    res.status(500).json({ error: 'Erreur lors de la réception.' });
  }
});


// 2. CORRECTION PREREQUIS : Retour au magasin d'une livraison échouée
router.post('/return-delivery/:id', authenticateLfdToken, requireLfdPermission('delivery.return'), async (req, res) => {
  try {
    const delivery = await getSql(`SELECT * FROM LFD_Deliveries WHERE id = ?`, [req.params.id]);
    if (!delivery) return res.status(404).json({ error: 'Livraison introuvable.' });
    if (delivery.status !== 'FAILED') return res.status(400).json({ error: 'Seule une livraison FAILED peut être retournée.' });

    const release = await getSql(`SELECT * FROM LFD_StockReleases WHERE id = ?`, [delivery.stock_release_id]);
    if (!release) return res.status(404).json({ error: 'Bon de sortie introuvable.' });
    if (release.status === 'RETURNED') return res.status(400).json({ error: 'Cette sortie a déjà été retournée en stock.' });

    const prepOrder = await getSql(`SELECT * FROM LFD_PreparationOrders WHERE id = ?`, [release.preparation_order_id]);
    const items = await allSql(`SELECT * FROM LFD_PreparationItems WHERE preparation_order_id = ?`, [prepOrder.id]);

    await runTransaction(async () => {
      // 1. Créer les mouvements de stock de retour
      for (let item of items) {
        // Obtenir le product_id via la ligne de vente
        const saleItem = await getSql(`SELECT product_id FROM LFD_SaleItems WHERE id = ?`, [item.sale_item_id]);
        
        const movRef = `MVT-RET-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        await runSql(`
          INSERT INTO LFD_StockMovements (reference, product_id, warehouse_id, movement_type, quantity, source_type, source_id, reason, created_by)
          VALUES (?, ?, ?, 'ENTRY', ?, 'RETURN', ?, ?, ?)
        `, [movRef, saleItem.product_id, release.warehouse_id, item.quantity_prepared, release.id, 'Retour de Livraison Échouée ' + delivery.delivery_number, req.user.id]);
      }

      // 2. Mettre à jour le bon de sortie
      await runSql(`UPDATE LFD_StockReleases SET status = 'RETURNED' WHERE id = ?`, [release.id]);

      // 3. Mettre à jour la livraison pour indiquer qu'elle est retournée
      await runSql(`UPDATE LFD_Deliveries SET status = 'RETURNED_TO_WAREHOUSE', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [delivery.id]);
      
      // 4. Audit
      await logLfdAudit(req.user.id, 'RETURN_STOCK', 'LFD_Deliveries', delivery.id, { status: 'FAILED' }, { status: 'RETURNED_TO_WAREHOUSE' }, 'Réintégration du stock suite échec de livraison', req.ip);
    });

    res.json({ success: true, message: 'Stock réintégré avec succès.' });

  } catch (error) {
    console.error('[LFD RECEIPTS] Erreur POST /return-delivery/:id:', error);
    res.status(500).json({ error: 'Erreur lors du retour en stock.' });
  }
});

module.exports = router;
