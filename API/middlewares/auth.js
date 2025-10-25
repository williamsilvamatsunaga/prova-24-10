const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  console.error('Falta a variável de ambiente SECRET_KEY');
  process.exit(1);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user; // Adiciona o usuário ao objeto req
    next();
  });
}

module.exports = authenticateToken;