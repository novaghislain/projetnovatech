const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSql, runSql } = require('../lfdDb');
const { authenticateLfdToken } = require('../middlewares/lfdAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_FormationNova_key_2026';

// Route de Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const employee = await getSql(`
      SELECT e.*, r.code as role 
      FROM LFD_Employees e
      LEFT JOIN LFD_Roles r ON e.role_id = r.id
      WHERE e.email = ?
    `, [email.toLowerCase()]);
    
    if (!employee) {
      return res.status(400).json({ error: 'Identifiants incorrects.' });
    }

    if (employee.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Ce compte a été désactivé. Veuillez contacter la direction.' });
    }

    const isValid = await bcrypt.compare(password, employee.password_hash);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Identifiants incorrects.' });
    }

    // Mise à jour du last_login_at
    await runSql(`UPDATE LFD_Employees SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [employee.id]);

    const token = jwt.sign(
      { 
        id: employee.id, 
        email: employee.email, 
        role: employee.role_id, // L'ID du rôle est plus sûr pour les requêtes RBAC futures, mais on a modifié requireLfdPermission pour checker la DB
        isLfdEmployee: true 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    const { password_hash: _p, ...safeEmployee } = employee;

    res.json({
      employee: safeEmployee,
      token
    });
    
  } catch (error) {
    console.error('[LFD AUTH] Erreur serveur lors du login:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Route pour récupérer le profil actuel (Me)
router.get('/me', authenticateLfdToken, async (req, res) => {
  try {
    const employee = await getSql(`
      SELECT e.*, r.code as role 
      FROM LFD_Employees e
      LEFT JOIN LFD_Roles r ON e.role_id = r.id
      WHERE e.id = ?
    `, [req.user.id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employé introuvable.' });
    }
    
    if (employee.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Ce compte a été désactivé.' });
    }

    const { password_hash: _p, ...safeEmployee } = employee;
    res.json({ employee: safeEmployee });

  } catch (error) {
    console.error('[LFD AUTH] Erreur serveur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
