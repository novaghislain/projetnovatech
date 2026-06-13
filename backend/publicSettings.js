const db = require('./db');
module.exports = function(app) {
  app.get('/api/public/settings', (req, res) => {
    db.get("SELECT siteName, themeColor, fontFamily, seoTitle, seoDescription, seoKeywords FROM GeneralSettings WHERE id = 1", [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || {});
    });
  });
};
