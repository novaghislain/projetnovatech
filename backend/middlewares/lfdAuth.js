const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_FormationNova_key_2026';

const authenticateLfdToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;

  if (!token) return res.status(401).json({ error: 'Accès refusé. Token manquant.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré.' });
    
    // On s'assure que ce token provient bien d'un employé LFD
    if (!user.isLfdEmployee) {
      return res.status(403).json({ error: 'Accès refusé. Ce compte n\'est pas un compte employé LFD.' });
    }
    
    req.user = user;
    next();
  });
};

const { getSql, runSql } = require('../lfdDb');

const logLfdAudit = async (employee_id, action, entity_type, entity_id, old_value, new_value, reason, ip_address) => {
  try {
    await runSql(`
      INSERT INTO LFD_AuditLogs (employee_id, action, entity_type, entity_id, old_value, new_value, reason, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employee_id,
      action,
      entity_type,
      entity_id,
      old_value ? JSON.stringify(old_value) : null,
      new_value ? JSON.stringify(new_value) : null,
      reason || null,
      ip_address || null
    ]);
  } catch (err) {
    console.error("[LFD AUDIT] Erreur lors de l'insertion du log:", err);
  }
};

const requireLfdPermission = (permissionCode) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Accès refusé. Rôle manquant.' });
    }
    
    try {
      // Le JWT contient req.user.role qui est maintenant le role_id, ou on l'a gardé en string ?
      // Dans lfdAuthRoutes.js, on mettait employee.role_id si on l'a mis à jour.
      // Vérifions : la migration de Phase 2 a changé LFD_Employees.role_id
      // Donc req.user a besoin du role_id
      
      const employee = await getSql(`SELECT role_id FROM LFD_Employees WHERE id = ?`, [req.user.id]);
      if (!employee || !employee.role_id) {
        return res.status(403).json({ error: 'Accès refusé. Rôle introuvable en base.' });
      }

      // Vérifier si le rôle a la permission demandée
      const hasPerm = await getSql(`
        SELECT 1 FROM LFD_RolePermissions rp
        JOIN LFD_Permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ? AND p.code = ?
      `, [employee.role_id, permissionCode]);

      if (!hasPerm) {
        // Log tentative d'accès non autorisé
        await logLfdAudit(req.user.id, 'UNAUTHORIZED_ACCESS_ATTEMPT', 'SYSTEM', null, null, { path: req.path, permission: permissionCode }, 'Tentative d\'accès sans permission', req.ip);
        return res.status(403).json({ error: 'Accès refusé. Permission insuffisante.' });
      }

      next();
    } catch (err) {
      console.error('[LFD AUTH] Erreur RBAC:', err);
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions.' });
    }
  };
};

module.exports = {
  authenticateLfdToken,
  requireLfdPermission,
  logLfdAudit
};
