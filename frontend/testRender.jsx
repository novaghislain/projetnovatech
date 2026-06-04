import React from 'react';
import { renderToString } from 'react-dom/server';
import { BrowserRouter } from 'react-router-dom';
import FormateurDashboard from './src/pages/FormateurDashboard.jsx';

// Mock useAuth
jest.mock('./src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'formateur', id: 1 }, logout: () => {} })
}));

try {
  const html = renderToString(
    <BrowserRouter>
      <FormateurDashboard />
    </BrowserRouter>
  );
  console.log("Render successful!");
} catch (err) {
  console.error("RENDER ERROR:", err);
}
