require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
const db = require('./db');

db.all("SELECT * FROM Enrollments WHERE userId = 1", [], (err, rows) => {
    if (err) console.error(err);
    console.log(rows);
});
