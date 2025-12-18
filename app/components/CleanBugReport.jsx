"use client";

import { useState } from "react";

export default function CleanBugReport() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return setMessage({ type: "error", text: "Please describe the issue." });
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, description }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Thanks — your report was sent.' });
        setName(''); setEmail(''); setSubject(''); setDescription('');
        setTimeout(() => { setOpen(false); setMessage(null); }, 1500);
      } else {
        setMessage({ type: 'error', text: data?.error || 'Send failed' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="bug-report-floating" onClick={() => setOpen(true)} title="Report a bug">
        🐞 Report
      </button>

      {open && <div className="modal-overlay" onClick={() => setOpen(false)} />}

      {open && (
        <div className="bug-report-modal" onClick={(e)=>e.stopPropagation()}>
          <div className="modal-header">
            <h3>Report a bug</h3>
            <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <form className="modal-content" onSubmit={submit}>
            <div className="form-group">
              <input placeholder="Your name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="form-group">
              <input placeholder="Your email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <input placeholder="Subject (short)" value={subject} onChange={(e)=>setSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <textarea placeholder="Describe the bug or feedback" value={description} onChange={(e)=>setDescription(e.target.value)} rows={6} />
            </div>
            {message && (
              <div style={{marginBottom:8,color: message.type==='error'?'var(--danger)':'var(--success)'}}>{message.text}</div>
            )}
            <div style={{display:'flex',gap:8}}>
              <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Sending...':'Send Report'}</button>
              <button type="button" className="btn-delete" onClick={()=>setOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
