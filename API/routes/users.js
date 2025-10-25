const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  console.error('Falta a variável de ambiente SECRET_KEY');
  process.exit(1);
}

// Registro de usuário
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Campos "username" e "password" são obrigatórios' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hash], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Nome de usuário já existe' });
        }
        console.error('Erro ao registrar usuário:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Usuário criado com sucesso' });
    });
  } catch (err) {
    console.error('Erro ao hashear a senha:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login de usuário
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Campos "username" e "password" são obrigatórios' });
  }
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      return res.json({ token });
    }
    res.status(401).json({ error: 'Credenciais inválidas' });
  });
});

module.exports = router;