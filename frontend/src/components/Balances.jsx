import React, { useEffect, useState } from 'react';
import { fetchBalances, seed } from '../api';

export default function Balances({ refreshSignal }) {
  const [data, setData] = useState(null);
  const [loadingSeed, setLoadingSeed] = useState(false);

  async function load() {
    const res = await fetchBalances();
    setData(res);
  }

  useEffect(()=> { load(); }, [refreshSignal]);

  async function doSeed() {
    if (!confirm('This will add sample data to the backend database (people + expenses).')) return;
    setLoadingSeed(true);
    try {
      await seed();
      await load();
      alert('Seed complete');
    } catch (err) {
      alert('Seed failed: ' + err.message);
    } finally { setLoadingSeed(false); }
  }

  if (!data) return <div className="card">Loading balances...</div>;

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3>Balances</h3>
        <div>
          <button className="button" onClick={doSeed} disabled={loadingSeed}>{loadingSeed ? 'Seeding...' : 'Seed sample data'}</button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8}}>
        {Object.values(data.balances).map(b => (
          <div key={b.id} style={{padding:8, borderRadius:8, border:'1px solid #f0f0f0'}}>
            <div style={{fontWeight:700}}>{b.name}</div>
            <div className="small">Net: <strong>${b.balance.toFixed(2)}</strong></div>
            <div className="small">{b.balance >= 0 ? 'Should receive' : 'Owes'}</div>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <h4>Suggested settlements</h4>
        {data.settlements.length === 0 ? <div className="small">All settled up</div> :
          <ul className="list">
            {data.settlements.map((s, i)=>(
              <li key={i}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>{s.from.name} → {s.to.name}</div>
                  <div><strong>${s.amount.toFixed(2)}</strong></div>
                </div>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}
