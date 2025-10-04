import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

function isBreached(ticket) {
  const created = new Date(ticket.created_at).getTime();
  const due = created + (ticket.sla_hours || 0) * 3600 * 1000;
  return Date.now() > due;
}

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, limit, offset };
      const res = await API.get('tickets/', { params });

      if (res.data && Array.isArray(res.data)) {
        setTickets(res.data);
        setCount(res.data.length);
      } else if (res.data && res.data.results) {
        setTickets(res.data.results);
        setCount(res.data.count);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        alert('Unauthorized — login again');
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [offset, limit]);

  const onSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchTickets();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Tickets</h1>
        <div className="space-x-2">
          <Link to="/tickets/new" className="bg-green-600 text-white px-3 py-1 rounded">New Ticket</Link>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <input className="flex-1 border p-2 rounded" placeholder="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Search</button>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
              <div>
                <Link to={`/tickets/${t.id}`} className="text-lg font-medium">{t.title}</Link>
                <div className="text-sm text-slate-600">{t.description?.slice(0, 120)}{t.description?.length > 120 ? '…' : ''}</div>
                <div className="text-xs mt-1">By: {t.created_by?.username || '—'} • Status: {t.status}</div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded text-sm ${isBreached(t) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {isBreached(t) ? 'SLA BREACHED' : 'Within SLA'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <div>Showing {tickets.length} {count ? `of ${count}` : ''}</div>
        <div className="space-x-2">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={() => setOffset(offset + limit)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
}