const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./db.cjs');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// If a built frontend exists, serve it as static files from backend so the app
// can be served from a single URL (http://localhost:4000) after `npm run build`
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // fallback to index.html for SPA routes - use a middleware (avoid path-to-regexp '*' parsing issues)
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    app.use((req, res, next) => {
      // only handle GET requests that accept HTML
      if (req.method === 'GET' && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
        return res.sendFile(indexFile);
      }
      next();
    });
  }
}

// routes
app.use('/api/people', require('./routes/people.cjs'));
app.use('/api/expenses', require('./routes/expenses.cjs'));
app.use('/api/balances', require('./routes/balances.cjs'));

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
