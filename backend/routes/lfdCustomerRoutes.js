const express = require('express');
const router = express.Router();
const { getSql, runSql, allSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');

// Récupérer tous les clients
router.get('/', authenticateLfdToken, requireLfdPermission('customer.read'), async (req, res) => {
  try {
    const customers = await allSql(`SELECT * FROM LFD_Customers WHERE status != 'DELETED' ORDER BY id DESC`);
    res.json(customers);
  } catch (error) {
    console.error('[LFD CUSTOMERS] Erreur GET /:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients.' });
  }
});

// Créer un client
router.post('/', authenticateLfdToken, requireLfdPermission('customer.create'), async (req, res) => {
  const { name, phone, email, address, credit_allowed, credit_limit } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom du client est requis.' });
  }
  
  if (credit_allowed && credit_limit < 0) {
    return res.status(400).json({ error: 'La limite de crédit ne peut pas être négative.' });
  }
  
  // Validation d'email basique
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide.' });
  }

  try {
    // Génération du code client unique
    const countRow = await getSql(`SELECT COUNT(*) as count FROM LFD_Customers`);
    const newCount = (countRow.count || 0) + 1;
    const customer_code = `CLI-${String(newCount).padStart(4, '0')}`;

    await runSql(`
      INSERT INTO LFD_Customers (customer_code, name, phone, email, address, credit_allowed, credit_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, [customer_code, name, phone || null, email || null, address || null, credit_allowed ? 1 : 0, credit_limit || 0]);

    const newCustomer = await getSql(`SELECT * FROM LFD_Customers WHERE customer_code = ?`, [customer_code]);
    
    // Log Audit
    await logLfdAudit(req.user.id, 'CREATE', 'LFD_Customers', newCustomer.id, null, newCustomer, 'Création d\'un client', req.ip);

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('[LFD CUSTOMERS] Erreur POST /:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ce client existe déjà (conflit de code).' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du client.' });
  }
});

// Mettre à jour un client
router.put('/:id', authenticateLfdToken, requireLfdPermission('customer.update'), async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, credit_allowed, credit_limit, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom du client est requis.' });
  }

  if (credit_allowed && credit_limit < 0) {
    return res.status(400).json({ error: 'La limite de crédit ne peut pas être négative.' });
  }

  try {
    const oldCustomer = await getSql(`SELECT * FROM LFD_Customers WHERE id = ?`, [id]);
    if (!oldCustomer) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }

    await runSql(`
      UPDATE LFD_Customers
      SET name = ?, phone = ?, email = ?, address = ?, credit_allowed = ?, credit_limit = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, phone || null, email || null, address || null, 
      credit_allowed ? 1 : 0, credit_limit || 0, status || 'ACTIVE', id
    ]);

    const updatedCustomer = await getSql(`SELECT * FROM LFD_Customers WHERE id = ?`, [id]);

    // Log Audit
    await logLfdAudit(req.user.id, 'UPDATE', 'LFD_Customers', id, oldCustomer, updatedCustomer, 'Modification du client', req.ip);

    res.json(updatedCustomer);
  } catch (error) {
    console.error('[LFD CUSTOMERS] Erreur PUT /:id:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client.' });
  }
});

// Récupérer un client spécifique
router.get('/:id', authenticateLfdToken, requireLfdPermission('customer.read'), async (req, res) => {
  try {
    const customer = await getSql(`SELECT * FROM LFD_Customers WHERE id = ?`, [req.params.id]);
    if (!customer) return res.status(404).json({ error: 'Client introuvable.' });
    res.json(customer);
  } catch (error) {
    console.error('[LFD CUSTOMERS] Erreur GET /:id:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
