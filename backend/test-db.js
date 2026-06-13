const { createClient } = require('@libsql/client');
require('dotenv').config();
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
async function test() {
  try {
    const resE = await client.execute("PRAGMA table_info(Enrollments)");
    console.log("Enrollments columns:", resE.rows.map(r => r.name).join(', '));
    const resF = await client.execute("PRAGMA table_info(Formations)");
    console.log("Formations columns:", resF.rows.map(r => r.name).join(', '));
  } catch (err) {
    console.error(err);
  }
}
test();
