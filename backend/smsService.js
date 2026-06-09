const dotenv = require('dotenv');
dotenv.config();

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

if (twilioSid && twilioAuthToken) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(twilioSid, twilioAuthToken);
    console.log('[SMS] Twilio client initialized successfully.');
  } catch (err) {
    console.warn('[SMS] Failed to initialize Twilio client. Make sure the library is installed.');
  }
}

async function sendSMS({ to, message }) {
  if (twilioClient && twilioFrom) {
    try {
      const res = await twilioClient.messages.create({
        body: message,
        from: twilioFrom,
        to: to
      });
      console.log(`[SMS SUCCESS] Message sent to ${to}. SID: ${res.sid}`);
      return res;
    } catch (err) {
      console.error(`[SMS ERROR] Failed to send SMS to ${to}:`, err.message);
      logMockSMS({ to, message });
    }
  } else {
    logMockSMS({ to, message });
  }
}

function logMockSMS({ to, message }) {
  console.log('\n┌────────────────────────────────────────────────────────────┐');
  console.log('│                    SIMULATION DE NOTIFICATION SMS          │');
  console.log('├────────────────────────────────────────────────────────────┤');
  console.log(`│ Destinataire : ${to.padEnd(43)} │`);
  console.log('│ Message :                                                  │');
  const lines = message.match(/.{1,50}/g) || [message];
  lines.forEach(line => {
    console.log(`│   ${line.padEnd(52)}       │`);
  });
  console.log('└────────────────────────────────────────────────────────────┘\n');
}

module.exports = { sendSMS };
