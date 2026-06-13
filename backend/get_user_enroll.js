require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const query = `
  SELECT * FROM Enrollments ORDER BY id DESC LIMIT 5;
`;
client.execute(query).then(res => {
  console.log("Enrollments:", res.rows);
}).catch(err => {
  console.error("Error:", err.message);
});
