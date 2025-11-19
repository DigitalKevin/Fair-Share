const express = require('express');
const router = express.Router();
const db = require('../db.cjs');

// helper: compute balances and suggested settlements
router.get('/', (req, res) => {
  // 1) load people
  const people = db.prepare('SELECT id, name FROM people').all();
  if (people.length === 0) return res.json({ people: [], balances: {}, settlements: [] });

  // 2) load expenses
  // ignore soft-deleted expenses
  const expenses = db.prepare('SELECT * FROM expenses WHERE deleted IS NULL OR deleted = 0').all().map(e => {
    e.participants = JSON.parse(e.participants);
    return e;
  });

  // compute per-person net balance: positive => they should receive money; negative => they owe
  const balances = {};
  people.forEach(p => balances[p.id] = 0.0);

  expenses.forEach(exp => {
    const shareCount = exp.participants.length;
    const share = exp.amount / shareCount;
    // payer gets full amount credited, each participant owes share
    balances[exp.payer_id] += exp.amount;
    exp.participants.forEach(pid => {
      balances[pid] -= share;
    });
  });

  // round balances to cents
  Object.keys(balances).forEach(k => {
    balances[k] = Math.round((balances[k] + Number.EPSILON) * 100) / 100;
  });

  // produce minimal settlements (greedy): creditors positive, debtors negative
  const creditors = [];
  const debtors = [];
  for (const [idStr, bal] of Object.entries(balances)) {
    const id = parseInt(idStr);
    if (bal > 0.005) creditors.push({ id, amount: bal });
    else if (bal < -0.005) debtors.push({ id, amount: -bal }); // store positive owed amount
  }
  // sort descending creditors, descending debtors
  creditors.sort((a,b)=>b.amount-a.amount);
  debtors.sort((a,b)=>b.amount-b.amount);

  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const pay = Math.min(debtor.amount, creditor.amount);
    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round((pay + Number.EPSILON)*100)/100
    });
    debtor.amount -= pay;
    creditor.amount -= pay;
    if (debtor.amount <= 0.005) i++;
    if (creditor.amount <= 0.005) j++;
  }

  // attach names
  const peopleMap = {};
  people.forEach(p => peopleMap[p.id] = p.name);

  const settlementsNamed = settlements.map(s => ({
    from: { id: s.from, name: peopleMap[s.from] || String(s.from) },
    to: { id: s.to, name: peopleMap[s.to] || String(s.to) },
    amount: s.amount
  }));

  const balancesNamed = {};
  for (const p of people) balancesNamed[p.id] = { id: p.id, name: p.name, balance: balances[p.id] };

  res.json({ people, expenses, balances: balancesNamed, settlements: settlementsNamed });
});

module.exports = router;
