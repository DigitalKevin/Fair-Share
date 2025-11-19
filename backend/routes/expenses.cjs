const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

// get all expenses
router.get('/', (req, res) => {
  const includeDeleted = req.query.includeDeleted === '1' || req.query.includeDeleted === 'true';
  const sql = includeDeleted
    ? 'SELECT * FROM expenses ORDER BY date DESC, id DESC'
    : 'SELECT * FROM expenses WHERE deleted IS NULL OR deleted = 0 ORDER BY date DESC, id DESC';
  const rows = db.prepare(sql).all();
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

// soft-delete expense (mark deleted=1)
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare('UPDATE expenses SET deleted = 1 WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

// restore a soft-deleted expense (undo)
router.post('/:id/restore', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  const info = db.prepare('UPDATE expenses SET deleted = 0 WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
