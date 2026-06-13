require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const query = `
  UPDATE Enrollments
  SET userId = (
    SELECT id FROM Users WHERE LOWER(Users.email) = LOWER(COALESCE(Enrollments.guestEmail, Enrollments.parentEmail))
  )
  WHERE userId IS NULL;
`;
client.execute(query).then(res => {
  console.log("Updated enrollments.");
}).catch(err => {
  console.error("Error:", err.message);
});
