const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./lfd_database.sqlite');
const axios = require('axios');

async function getInitialState() {
  return new Promise((resolve) => {
    db.all(`SELECT product_id, SUM(CASE WHEN movement_type IN ('ENTRY', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN') THEN quantity ELSE -quantity END) as stock FROM LFD_StockMovements WHERE product_id IN (1, 2) GROUP BY product_id`, [], (err, rows) => {
      console.log("=== INITIAL STOCKS ===");
      console.log(rows);
      
      db.all(`SELECT * FROM LFD_CashSessions WHERE status = 'OPEN'`, [], (err, rows) => {
        console.log("=== OPEN CASH SESSIONS ===");
        console.log(rows);
        db.close();
        resolve();
      });
    });
  });
}
getInitialState();
