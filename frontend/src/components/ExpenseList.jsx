import React, { useEffect, useState } from 'react';
import { fetchExpensesWithDeleted, fetchPeople, deleteExpense, restoreExpense } from '../api';

export default function ExpenseList({ refreshSignal }) {
  const [expenses, setExpenses] = useState([]);
  const [peopleMap, setPeopleMap] = useState({});
  const [showDeleted, setShowDeleted] = useState(false);

  async function load() {
    const [exp, ppl] = await Promise.all([fetchExpensesWithDeleted(showDeleted), fetchPeople()]);
    setExpenses(exp);
    const map = {};
    ppl.forEach(p => map[p.id] = p.name);
    setPeopleMap(map);
  }

  useEffect(()=> { load(); }, [refreshSignal, showDeleted]);

  return (
    <div className="card">
      <h3>Expenses</h3>
      <ul className="list">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <div className="small">Expenses</div>
          <label style={{display:'flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={showDeleted} onChange={e=>setShowDeleted(e.target.checked)} />
            <span className="small">Show deleted</span>
          </label>
        </div>
        {expenses.length === 0 && <li className="small">No expenses yet</li>}
        {expenses.map(e => (
          <li key={e.id}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                  <strong style={e.deleted ? {textDecoration:'line-through', color:'#888'} : {}}>{e.description || '—'}</strong>
                  <div className="small">paid by {peopleMap[e.payer_id] || e.payer_id} • split among: {e.participants.map(id => peopleMap[id] || id).join(', ')}</div>
                </div>
                <div style={{textAlign:'right', display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}}>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div className="badge">${Number(e.amount).toFixed(2)}</div>
                    {!e.deleted ? (
                      <button className="delete-btn" title="Delete expense" onClick={async()=>{
                        if (!confirm('Delete this expense? You can restore it later by enabling "Show deleted" and clicking Restore.')) return;
                        try {
                          await deleteExpense(e.id);
                          await load();
                        } catch (err) {
                          alert('Delete failed: ' + err.message);
                        }
                      }}> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    ) : (
                      <button className="restore-btn" title="Restore expense" onClick={async()=>{
                        try {
                          await restoreExpense(e.id);
                          await load();
                        } catch (err) {
                          alert('Restore failed: ' + err.message);
                        }
                      }}>Restore</button>
                    )}
                  </div>
                </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
