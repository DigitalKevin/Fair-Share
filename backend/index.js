const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// routes
app.use('/api/people', require('./routes/people'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/balances', require('./routes/balances'));

// seed convenience endpoint (not required, but handy)
app.post('/api/seed', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  try {
    db.exec(seed);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`FairShare backend running on http://localhost:${PORT}`);
});
