const express = require('express');

module.exports = (db, authenticateToken) => {
  const router = express.Router();

  const requireAnnonceur = (req, res, next) => {
    if (req.user.role !== 'annonceur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };

  // GET /dashboard - Stats overview
  router.get('/dashboard', authenticateToken, requireAnnonceur, (req, res) => {
    const userId = req.user.id;
    const query = req.user.role === 'admin' ? 'SELECT * FROM Advertisements' : 'SELECT * FROM Advertisements WHERE userId = ?';
    const params = req.user.role === 'admin' ? [] : [userId];

    db.all(query, params, (err, ads) => {
      if (err) return res.status(500).json({ error: 'Erreur DB' });

      let activeAds = 0;
      let expiredAds = 0;
      let totalViews = 0;
      let totalClicks = 0;
      let totalSpent = 0;

      ads.forEach(ad => {
        totalViews += (ad.views || 0);
        totalClicks += (ad.clicks || 0);
        if (ad.status === 'Active') activeAds++;
        if (ad.status === 'Expirée') expiredAds++;
        if (ad.paymentStatus === 'Payé') totalSpent += (ad.budget || 0);
      });

      const nextExpiring = ads.filter(a => a.status === 'Active').sort((a,b) => new Date(a.endDate) - new Date(b.endDate))[0] || null;

      res.json({
        activeAds,
        expiredAds,
        totalViews,
        totalClicks,
        totalSpent,
        nextExpiring
      });
    });
  });

  // GET /ads
  router.get('/ads', authenticateToken, requireAnnonceur, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM Advertisements WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, ads) => {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json(ads);
    });
  });

  // POST /ads (Create)
  router.post('/ads', authenticateToken, requireAnnonceur, (req, res) => {
    const { title, placement, imageUrl, targetUrl, startDate, endDate, budget } = req.body;
    const userId = req.user.id;
    const advertiserName = req.user.firstName || req.user.email;

    const query = `
      INSERT INTO Advertisements (
        userId, title, advertiserName, placement, imageUrl, targetUrl,
        startDate, endDate, budget, status, paymentStatus, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'En attente', 'En attente', 0)
    `;
    db.run(query, [userId, title, advertiserName, placement, imageUrl, targetUrl, startDate, endDate, budget], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json({ success: true, adId: this.lastID });
    });
  });

  // POST /ads/:id/pay (Mock payment)
  router.post('/ads/:id/pay', authenticateToken, requireAnnonceur, (req, res) => {
    const adId = req.params.id;
    const userId = req.user.id;
    
    const query = `UPDATE Advertisements SET status = 'Active', paymentStatus = 'Payé', isActive = 1 WHERE id = ? AND userId = ?`;
    db.run(query, [adId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json({ success: true });
    });
  });

  // GET /payments
  router.get('/payments', authenticateToken, requireAnnonceur, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT id, title, budget, paymentStatus, createdAt as date FROM Advertisements WHERE userId = ? AND paymentStatus != "En attente" ORDER BY createdAt DESC', [userId], (err, payments) => {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json(payments);
    });
  });

  // PUT /ads/:id (Modifier)
  router.put('/ads/:id', authenticateToken, requireAnnonceur, (req, res) => {
    const adId = req.params.id;
    const userId = req.user.id;
    const { title, placement, imageUrl, targetUrl, startDate, endDate, budget } = req.body;
    
    const query = `
      UPDATE Advertisements 
      SET title = ?, placement = ?, imageUrl = ?, targetUrl = ?, 
          startDate = ?, endDate = ?, budget = ?
      WHERE id = ? AND userId = ?
    `;
    db.run(query, [title, placement, imageUrl, targetUrl, startDate, endDate, budget, adId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json({ success: true });
    });
  });

  // DELETE /ads/:id (Supprimer)
  router.delete('/ads/:id', authenticateToken, requireAnnonceur, (req, res) => {
    const adId = req.params.id;
    const userId = req.user.id;
    
    db.run(`DELETE FROM Advertisements WHERE id = ? AND userId = ?`, [adId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json({ success: true });
    });
  });

  // POST /ads/:id/renew (Renouveler)
  router.post('/ads/:id/renew', authenticateToken, requireAnnonceur, (req, res) => {
    const adId = req.params.id;
    const userId = req.user.id;
    const { startDate, endDate, budget } = req.body;
    
    const query = `
      UPDATE Advertisements 
      SET startDate = ?, endDate = ?, budget = ?, status = 'En attente', paymentStatus = 'En attente', isActive = 0
      WHERE id = ? AND userId = ?
    `;
    db.run(query, [startDate, endDate, budget, adId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Erreur DB' });
      res.json({ success: true });
    });
  });

  return router;
};
