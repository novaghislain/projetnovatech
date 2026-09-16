const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getSql, allSql, runSql } = require('../lfdDb');
const { authenticateLfdToken, requireLfdPermission, logLfdAudit } = require('../middlewares/lfdAuth');

// 1. Lire tous les employés (et les rôles)
router.get('/', authenticateLfdToken, requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const employes = await allSql(`
      SELECT e.id, e.employee_code, e.firstName, e.lastName, e.email, e.phone, e.status, e.is_demo, r.name as role_name, r.code as role_code, r.id as role_id
      FROM LFD_Employees e
      LEFT JOIN LFD_Roles r ON e.role_id = r.id
      ORDER BY e.createdAt DESC
    `);
    
    const roles = await allSql(`SELECT id, code, name FROM LFD_Roles ORDER BY name`);
    
    res.json({ employes, roles });
  } catch (error) {
    console.error('[LFD EMPLOYEES] Erreur GET /:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 2. Créer un employé
router.post('/', authenticateLfdToken, requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role_id, password } = req.body;
    
    if (!firstName || !lastName || !email || !role_id || !password) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }

    const exist = await getSql(`SELECT id FROM LFD_Employees WHERE email = ?`, [email.toLowerCase()]);
    if (exist) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Générer un code employé
    const countRes = await getSql(`SELECT COUNT(*) as count FROM LFD_Employees`);
    const newCode = `EMP-${String(countRes.count + 1).padStart(4, '0')}`;

    const result = await runSql(`
      INSERT INTO LFD_Employees (employee_code, firstName, lastName, email, phone, role_id, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [newCode, firstName, lastName, email.toLowerCase(), phone, role_id, password_hash]);

    await logLfdAudit(req.user.id, 'CREATE_EMPLOYEE', 'EMPLOYEE', result.lastID, null, { email, role_id }, 'Création d\'un nouveau compte', req.ip);

    res.json({ success: true, message: "Employé créé avec succès", id: result.lastID });
  } catch (error) {
    console.error('[LFD EMPLOYEES] Erreur POST /:', error);
    res.status(500).json({ error: "Erreur serveur lors de la création de l'employé." });
  }
});

// 3. Modifier le statut d'un employé (Suspendre/Activer)
router.put('/:id/status', authenticateLfdToken, requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Vous ne pouvez pas modifier votre propre statut." });
    }

    const emp = await getSql(`SELECT status FROM LFD_Employees WHERE id = ?`, [id]);
    if (!emp) return res.status(404).json({ error: "Employé introuvable." });

    await runSql(`UPDATE LFD_Employees SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
    
    await logLfdAudit(req.user.id, 'UPDATE_EMPLOYEE_STATUS', 'EMPLOYEE', id, { status: emp.status }, { status }, 'Changement de statut', req.ip);

    res.json({ success: true });
  } catch (error) {
    console.error('[LFD EMPLOYEES] Erreur PUT /status:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 4. Modifier le mot de passe d'un employé (Forcé par l'admin)
router.put('/:id/password', authenticateLfdToken, requireLfdPermission('settings.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await runSql(`UPDATE LFD_Employees SET password_hash = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [password_hash, id]);
    
    await logLfdAudit(req.user.id, 'FORCE_CHANGE_PASSWORD', 'EMPLOYEE', id, null, null, 'Réinitialisation du mot de passe par un administrateur', req.ip);

    res.json({ success: true, message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error('[LFD EMPLOYEES] Erreur PUT /password:', error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 5. Modifier son propre avatar
router.put('/avatar', authenticateLfdToken, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ error: "L'image (base64) de l'avatar est requise." });
    }

    await runSql(`UPDATE LFD_Employees SET avatar = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [avatar, req.user.id]);
    
    await logLfdAudit(req.user.id, 'UPDATE_AVATAR', 'EMPLOYEE', req.user.id, null, null, 'Mise à jour de la photo de profil', req.ip);

    res.json({ success: true, avatar });
  } catch (error) {
    console.error('[LFD EMPLOYEES] Erreur PUT /avatar:', error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'avatar." });
  }
});

module.exports = router;
