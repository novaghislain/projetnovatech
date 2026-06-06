const express = require('express');

module.exports = (db, authenticateToken) => {
  const router = express.Router();

  router.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'annonceur' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin ? 'SELECT * FROM Advertisements' : 'SELECT * FROM Advertisements WHERE userId = ?';
    const params = isAdmin ? [] : [userId];

    // Fetch ads
    db.all(query, params, (err, ads) => {
      if (err) return res.status(500).json({ error: 'Erreur base de données' });

      let totalViews = 0;
      let totalClicks = 0;

      ads.forEach(ad => {
        totalViews += (ad.views || 0);
        totalClicks += (ad.clicks || 0);
      });

      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

      res.json({
        stats: {
          views: totalViews,
          clicks: totalClicks,
          ctr: ctr + '%'
        },
        campaigns: ads.map(ad => ({
          id: ad.id,
          title: ad.advertiserName + ' - ' + ad.placement,
          advertiserName: ad.advertiserName,
          placement: ad.placement,
          imageUrl: ad.imageUrl,
          targetUrl: ad.targetUrl,
          startDate: ad.startDate,
          endDate: ad.endDate,
          status: ad.isActive ? 'active' : 'ended',
          views: ad.views || 0,
          clicks: ad.clicks || 0,
          spent: ((ad.clicks || 0) * 100) + ' FCFA',
          ctr: ((ad.views || 0) > 0 ? (((ad.clicks || 0) / ad.views) * 100).toFixed(1) : 0) + '%'
        }))
      });
    });
  });

  return router;
};
