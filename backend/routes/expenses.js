const express = require('express');
const router = express.Router();
const db = require('../db');

// get all expenses
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all();
  // parse participants json
  rows.forEach(r => { r.participants = JSON.parse(r.participants); });
  res.json(rows);
});

// add expense
router.post('/', (req, res) => {
  const { description = '', amount, payer_id, participants } = req.body;
  if (typeof amount !== 'number' || !payer_id || !Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ error: 'amount (number), payer_id, participants (non-empty array) required' });
  }
  const participantsStr = JSON.stringify(participants);
  const stmt = db.prepare('INSERT INTO expenses (description, amount, payer_id, participants) VALUES (?, ?, ?, ?)');
  const info = stmt.run(description, amount, payer_id, participantsStr);
  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  expense.participants = JSON.parse(expense.participants);
  res.status(201).json(expense);
});

module.exports = router;
