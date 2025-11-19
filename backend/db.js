// db.js - simple sqlite wrapper
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'fairshare.db'));

// create tables if not exist
db.exec(`
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT,
  amount REAL NOT NULL,
  payer_id INTEGER NOT NULL,
  date TEXT DEFAULT (datetime('now')),
  participants TEXT NOT NULL, -- JSON array of person ids who share this expense
  FOREIGN KEY (payer_id) REFERENCES people(id)
);
`);

module.exports = db;
