const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 15, email: 'tinasogbossi57@gmail.com', role: 'apprenant' }, 'super_secret_FormationNova_key_2026', { expiresIn: '1h' });
console.log(token);
