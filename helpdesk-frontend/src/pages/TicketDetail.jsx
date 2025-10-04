import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

function computeDue(ticket) {
  if (!ticket?.created_at) return null;
  const created = new Date(ticket.created_at).getTime();
  const due = created + (ticket.sla_hours || 0) * 3600 * 1000;
  return new Date(due);
}

function formatRemaining(ms) {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`tickets/${id}/`);
      setTicket(res.data);
      setStatus(res.data.status);
      updateRemaining(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const updateRemaining = (t) => {
    const due = computeDue(t);
    if (!due) return setRemaining(null);
    const tick = () => {
      const ms = due.getTime() - Date.now();
      setRemaining(ms);
    };
    tick();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 1000);
  };

  const postComment = async (e) => {
  e.preventDefault();
  if (!commentText.trim()) return;
  try {
    await API.post(`tickets/${id}/comments/`, { content: commentText });
    setCommentText('');
    load();
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert('Failed to post comment');
    // console.error(err.response.data);
  }
};

  const patchStatus = async (e) => {
    e.preventDefault();
    if (!ticket) return;
    try {
      const payload = { status, version: ticket.version };
      await API.patch(`tickets/${id}/`, payload);
      await load();
      alert('Updated');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        alert('Stale update detected (version mismatch). Reloading...');
        load();
      } else {
        alert('Update failed');
      }
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!ticket) return <div className="p-6">Not found</div>;

  const timeline = [
    { type: 'created', time: ticket.created_at, text: `Ticket created by ${ticket.created_by?.username || '—'}` },
    ... (ticket.comments || []).map(c => ({ type: 'comment', time: c.created_at, text: `${c.author?.username || '—'}: ${c.content}` }))
  ].sort((a,b) => new Date(a.time) - new Date(b.time));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl">{ticket.title}</h1>
          <div className="text-sm text-slate-600">By {ticket.created_by?.username} • {new Date(ticket.created_at).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className={`px-2 py-1 rounded ${remaining <= 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {remaining <= 0 ? 'SLA BREACHED' : `Due in ${formatRemaining(remaining)}`}
          </div>
          <div className="text-xs mt-1">SLA hours: {ticket.sla_hours}</div>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Description</h3>
        <div className="mt-2 text-slate-700">{ticket.description}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Update status</h3>
          <form onSubmit={patchStatus} className="mt-2 space-y-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
            <div className="text-xs text-slate-600">Version: {ticket.version}</div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
              <Link to="/tickets" className="px-3 py-1 border rounded">Back</Link>
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Add comment</h3>
          <form onSubmit={postComment} className="mt-2">
            <textarea className="w-full border p-2 rounded" rows={4} placeholder="Write comment…" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <div className="flex gap-2 mt-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded">Post</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Timeline</h3>
        <div className="space-y-2 mt-3">
          {timeline.map((it, idx) => (
            <div key={idx} className="text-sm border-l-2 pl-3 py-1">
              <div className="text-xs text-slate-500">{new Date(it.time).toLocaleString()}</div>
              <div className="mt-1">{it.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}