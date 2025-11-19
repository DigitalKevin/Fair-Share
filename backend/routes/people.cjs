const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

// get all people
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT id, name FROM people ORDER BY id').all();
  res.json(rows);
});

// add person
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO people (name) VALUES (?)').run(name);
    const person = db.prepare('SELECT id, name FROM people WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
