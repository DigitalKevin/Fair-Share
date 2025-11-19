// db.cjs - CommonJS wrapper for sqlite
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
  participants TEXT NOT NULL,
  deleted INTEGER DEFAULT 0,
  FOREIGN KEY (payer_id) REFERENCES people(id)
);
`);

// Ensure 'deleted' column exists for older DBs (safe migration)
try {
  const info = db.prepare("PRAGMA table_info(expenses)").all();
  const hasDeleted = info.some(r => r.name === 'deleted');
  if (!hasDeleted) {
    db.exec("ALTER TABLE expenses ADD COLUMN deleted INTEGER DEFAULT 0");
  }
} catch (e) {
  // ignore migration errors
}

module.exports = db;
