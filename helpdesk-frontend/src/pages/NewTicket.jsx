import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slaHours, setSlaHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('tickets/new/', { title, description, sla_hours: Number(slaHours) });
      navigate('/tickets');
    } catch (err) {
      console.error("Create ticket failed:", err.response?.data || err.message);
  alert("Create failed: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-3">Create ticket</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full border p-2 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" className="border p-2 rounded w-36" value={slaHours} onChange={(e) => setSlaHours(e.target.value)} />
        <div className="flex gap-2">
          <button disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">Create</button>
          <button type="button" onClick={() => navigate('/tickets')} className="px-3 py-1 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}