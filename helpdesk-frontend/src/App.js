import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TicketsList from './pages/TicketsList';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';

function Protected({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/tickets"
            element={
              <Protected>
                <TicketsList />
              </Protected>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <Protected>
                <NewTicket />
              </Protected>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <Protected>
                <TicketDetail />
              </Protected>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}