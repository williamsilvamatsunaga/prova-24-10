const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas
router.use(authenticateToken);

// GET - Lista todos os itens do usuário autenticado
router.get('/', (req, res) => {
    const sql = 'SELECT id, name FROM items WHERE user_id = ?';
    const userId = req.user.id;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Erro ao consultar itens:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET - Retorna um item pelo ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT id, name FROM items WHERE id = ? AND user_id = ?';
    const id = req.params.id;
    const userId = req.user.id;
    db.get(sql, [id, userId], (err, row) => {
        if (err) {
            console.error('Erro ao consultar item:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário' });
        }
    });
});

// POST - Cria um novo item
router.post('/', (req, res) => {
    const name = req.body.name;
    const userId = req.user.id;
    if (!name) {
        return res.status(400).json({ error: 'O campo "name" é obrigatório' });
    }
    const sql = 'INSERT INTO items (name, user_id) VALUES (?, ?)';
    db.run(sql, [name, userId], function (err) {
        if (err) {
            console.error('Erro ao inserir item:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// PUT - Atualiza um item existente
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const userId = req.user.id;
    if (!name) {
        return res.status(400).json({ error: 'O campo "name" é obrigatório' });
    }
    const sql = 'UPDATE items SET name = ? WHERE id = ? AND user_id = ?';
    db.run(sql, [name, id, userId], function (err) {
        if (err) {
            console.error('Erro ao atualizar item:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário' });
        }
        res.json({ id: Number(id), name });
    });
});

// DELETE - Remove um item
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    const sql = 'DELETE FROM items WHERE id = ? AND user_id = ?';
    db.run(sql, [id, userId], function (err) {
        if (err) {
            console.error('Erro ao deletar item:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário' });
        }
        res.json({ message: 'Item removido com sucesso' });
    });
});

module.exports = router;