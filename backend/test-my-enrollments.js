require('dotenv').config();
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
const query = `
      SELECT e.id, e.amount, e.paymentMethod, e.paymentType, e.totalAmount, e.amountPaid, e.status, e.createdAt, e.transactionId,
             e.childFirstName, e.childLastName, e.rating, e.progress as manualProgress, e.exercises,
             f.id as courseId, f.title as courseTitle, f.isOnline, f.meetLink, f.whatsappLink, f.imageUrl,
             f.startDate, f.endDate, f.duration, f.sessionDuration, f.isLive, f.liveRoomName, f.price as courseFullPrice, f.format
      FROM Enrollments e
      JOIN Formations f ON e.courseId = f.id
      ORDER BY e.id DESC LIMIT 1
    `;
client.execute(query).then(res => {
  console.log("Success:", res.rows);
}).catch(err => {
  console.error("Error:", err.message);
});
