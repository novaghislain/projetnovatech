require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

client.execute(`
  CREATE TABLE IF NOT EXISTS UploadedImages (
    id TEXT PRIMARY KEY,
    mimeType TEXT,
    data TEXT
  )
`).then(() => {
  console.log("Table UploadedImages created successfully!");
}).catch(console.error);
