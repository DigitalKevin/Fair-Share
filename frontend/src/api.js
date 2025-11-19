const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function fetchPeople() {
  const res = await fetch(`${BASE}/people`);
  return res.json();
}
export async function addPerson(name) {
  const res = await fetch(`${BASE}/people`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function fetchExpenses() {
  const res = await fetch(`${BASE}/expenses`);
  return res.json();
}
export async function addExpense(payload) {
  const res = await fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: res.statusText }));
    throw new Error(err && err.error ? err.error : 'Failed to delete expense');
  }
  return { ok: true };
}

export async function restoreExpense(id) {
  const res = await fetch(`${BASE}/expenses/${id}/restore`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: res.statusText }));
    throw new Error(err && err.error ? err.error : 'Failed to restore expense');
  }
  return { ok: true };
}

// helper to fetch expenses with optional includeDeleted flag
export async function fetchExpensesWithDeleted(includeDeleted = false) {
  const url = includeDeleted ? `${BASE}/expenses?includeDeleted=1` : `${BASE}/expenses`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchBalances() {
  const res = await fetch(`${BASE}/balances`);
  return res.json();
}

export async function seed() {
  const res = await fetch(`${BASE}/seed`, { method: 'POST' });
  return res.json();
}
