import React, { useState, useEffect } from 'react';
import { fetchPeople, addExpense } from '../api';

export default function ExpenseForm({ onAdded }) {
  const [people, setPeople] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [participants, setParticipants] = useState([]);
  const [splitAll, setSplitAll] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    fetchPeople().then(ppl => {
      setPeople(ppl);
      // default: all people share the expense
      const ids = ppl.map(x=>x.id);
      setParticipants(ids);
      setSplitAll(true);
    });
  }, []);

  function togglePart(id) {
    if (splitAll) return; // manual toggles disabled when splitAll is on
    setParticipants(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return alert('Enter a valid amount');
    if (!payer) return alert('Choose payer');
    // ensure at least one participant
    const finalParticipants = (splitAll || participants.length === 0) ? people.map(p=>p.id) : participants.slice();
    if (finalParticipants.length === 0) return alert('Choose at least one participant');
    // ensure payer is included in the split (common expectation)
    if (!finalParticipants.includes(parseInt(payer))) finalParticipants.push(parseInt(payer));
    setLoading(true);
    try {
      await addExpense({
        description: desc,
        amount: amt,
        payer_id: parseInt(payer),
        participants: finalParticipants.map(x=>parseInt(x))
      });
      setDesc(''); setAmount(''); setParticipants([]); setPayer('');
      setSplitAll(true);
      onAdded && onAdded();
    } catch (err) {
      alert('Error adding expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Add an expense</h3>
      <form onSubmit={submit}>
        <input className="input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <input className="input" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <select className="input" value={payer} onChange={e=>setPayer(e.target.value)}>
            <option value="">Payer...</option>
            {people.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{marginTop:8}}>
          <div className="small">Who shares this expense? (default: all)</div>
          <div style={{display:'flex', gap:12, marginTop:6, alignItems:'center'}}>
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" checked={splitAll} onChange={e=>{
                const on = e.target.checked;
                setSplitAll(on);
                if (on) setParticipants(people.map(p=>p.id));
              }} />
              <span className="small">Split equally among everyone</span>
            </label>
            <div style={{fontSize:'0.9rem', color:'#666'}}>
              (Uncheck to select specific people)
            </div>
          </div>
          {!splitAll && (
            <div style={{display:'flex', gap:8, marginTop:6, flexWrap:'wrap'}}>
              {people.map(p => (
                <label key={p.id} style={{display:'flex', alignItems:'center', gap:6}}>
                  <input type="checkbox" checked={participants.includes(p.id)} onChange={()=>togglePart(p.id)} />
                  <span className="small">{p.name}</span>
                </label>
              ))}
            </div>
          )}
          {/* show estimated per-person share */}
          <div style={{marginTop:8}} className="small">
            {(() => {
              const amt = parseFloat(amount);
              const count = (splitAll ? people.length : (participants.length || 0));
              if (!amt || amt <= 0 || count === 0) return null;
              const share = Math.round((amt / count + Number.EPSILON) * 100) / 100;
              return `Estimated each pays: $${share.toFixed(2)} (based on ${count} ${count===1? 'person':'people'})`;
            })()}
          </div>
        </div>
        <div style={{marginTop:8}}>
          <button className="button" disabled={loading} type="submit">{loading ? 'Saving...' : 'Add expense'}</button>
        </div>
      </form>
    </div>
  );
}
