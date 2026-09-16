const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');

// Récupérer tous les produits
router.get('/', authenticateLfdToken, requireLfdPermission('product.read'), async (req, res) => {
  try {
    const products = await allSql(`
      SELECT p.*, c.name as category_name 
      FROM LFD_Products p
      LEFT JOIN LFD_ProductCategories c ON p.category_id = c.id
      WHERE p.status != 'DELETED' 
      ORDER BY p.id DESC
    `);
    res.json(products);
  } catch (error) {
    console.error('[LFD PRODUCTS] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});

// Créer un produit
router.post('/', authenticateLfdToken, requireLfdPermission('product.create'), async (req, res) => {
  const { name, category_id, unit, purchase_price, selling_price, minimum_stock } = req.body;

  if (!name || purchase_price === undefined || selling_price === undefined) {
    return res.status(400).json({ error: 'Nom, prix d\'achat et prix de vente sont requis.' });
  }
  
  if (purchase_price < 0 || selling_price < 0) {
    return res.status(400).json({ error: 'Les prix ne peuvent pas être négatifs.' });
  }

  try {
    // Vérifier que la catégorie existe si elle est fournie
    if (category_id) {
      const cat = await getSql(`SELECT id FROM LFD_ProductCategories WHERE id = ?`, [category_id]);
      if (!cat) return res.status(400).json({ error: 'Catégorie introuvable.' });
    }

    const countRow = await getSql(`SELECT COUNT(*) as count FROM LFD_Products`);
    const newCount = (countRow.count || 0) + 1;
    const product_code = `PROD-${String(newCount).padStart(4, '0')}`;

    await runSql(`
      INSERT INTO LFD_Products (product_code, name, category_id, unit, purchase_price, selling_price, minimum_stock, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, [product_code, name, category_id || null, unit || null, purchase_price, selling_price, minimum_stock || 0]);

    const newProduct = await getSql(`SELECT * FROM LFD_Products WHERE product_code = ?`, [product_code]);
    
    await logLfdAudit(req.user.id, 'CREATE', 'LFD_Products', newProduct.id, null, newProduct, 'Création d\'un produit', req.ip);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('[LFD PRODUCTS] Erreur POST /:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

// Mettre à jour un produit
router.put('/:id', authenticateLfdToken, requireLfdPermission('product.update'), async (req, res) => {
  const { id } = req.params;
  const { name, category_id, unit, purchase_price, selling_price, minimum_stock, status } = req.body;

  if (!name || purchase_price === undefined || selling_price === undefined) {
    return res.status(400).json({ error: 'Nom, prix d\'achat et prix de vente sont requis.' });
  }
  
  if (purchase_price < 0 || selling_price < 0) {
    return res.status(400).json({ error: 'Les prix ne peuvent pas être négatifs.' });
  }

  try {
    const oldProduct = await getSql(`SELECT * FROM LFD_Products WHERE id = ?`, [id]);
    if (!oldProduct) return res.status(404).json({ error: 'Produit introuvable.' });

    if (category_id) {
      const cat = await getSql(`SELECT id FROM LFD_ProductCategories WHERE id = ?`, [category_id]);
      if (!cat) return res.status(400).json({ error: 'Catégorie introuvable.' });
    }

    await runSql(`
      UPDATE LFD_Products
      SET name = ?, category_id = ?, unit = ?, purchase_price = ?, selling_price = ?, minimum_stock = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, category_id || null, unit || null, purchase_price, selling_price, minimum_stock || 0, status || 'ACTIVE', id]);

    const updatedProduct = await getSql(`SELECT * FROM LFD_Products WHERE id = ?`, [id]);

    await logLfdAudit(req.user.id, 'UPDATE', 'LFD_Products', id, oldProduct, updatedProduct, 'Modification du produit', req.ip);

    res.json(updatedProduct);
  } catch (error) {
    console.error('[LFD PRODUCTS] Erreur PUT /:id:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit.' });
  }
});

// Récupérer un produit spécifique
router.get('/:id', authenticateLfdToken, requireLfdPermission('product.read'), async (req, res) => {
  try {
    const product = await getSql(`SELECT * FROM LFD_Products WHERE id = ?`, [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json(product);
  } catch (error) {
    console.error('[LFD PRODUCTS] Erreur GET /:id:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
