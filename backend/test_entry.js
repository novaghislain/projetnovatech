const axios = require('axios');

async function testPost() {
  try {
    // Generate token for accountant
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 22, role: 'accountant', isLfdEmployee: true }, 'super_secret_FormationNova_key_2026');

    const payload = {
      journal_id: 1, // Assume journal 1 exists
      entry_date: new Date().toISOString().split('T')[0],
      description: 'Test post',
      source_type: "MANUAL",
      source_id: Date.now(),
      event_type: "MANUAL_ENTRY",
      lines: [
        { account_id: 1, description: 'Line 1', debit: 1000, credit: 0 },
        { account_id: 2, description: 'Line 2', debit: 0, credit: 1000 }
      ]
    };

    const res = await axios.post('http://localhost:5001/api/lfd/accounting/entries', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
testPost();
