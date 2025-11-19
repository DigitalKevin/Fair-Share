import React, { useState } from 'react';
import { addPerson } from '../api';

export default function PeopleForm({ onAdded }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addPerson(name.trim());
      setName('');
      onAdded && onAdded();
    } catch (err) {
      alert('Error adding person: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Add a person</h3>
      <form onSubmit={submit}>
        <input className="input" placeholder="Name (e.g. Alice)" value={name} onChange={e=>setName(e.target.value)} />
        <div style={{marginTop:8}}>
          <button className="button" disabled={loading} type="submit">{loading ? 'Adding...' : 'Add person'}</button>
        </div>
      </form>
    </div>
  );
}
