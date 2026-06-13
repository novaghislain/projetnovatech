const { createClient } = require('@libsql/client');
require('dotenv').config();
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
async function test() {
  try {
    const resM = await client.execute("PRAGMA table_info(Modules)");
    console.log("Modules:", resM.rows.map(r => r.name).join(', '));
    const resC = await client.execute("PRAGMA table_info(Chapters)");
    console.log("Chapters:", resC.rows.map(r => r.name).join(', '));
    const resL = await client.execute("PRAGMA table_info(Lessons)");
    console.log("Lessons:", resL.rows.map(r => r.name).join(', '));
    const resLP = await client.execute("PRAGMA table_info(LessonProgress)");
    console.log("LessonProgress:", resLP.rows.map(r => r.name).join(', '));
  } catch (err) {
    console.error(err);
  }
}
test();
