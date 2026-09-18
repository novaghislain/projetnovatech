import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import React from 'react';
import axios from 'axios';
import { API_URL } from './config';

// Global interceptor to fix hardcoded localhost URLs for network devices (e.g. mobile phones)
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith(`${API_URL}`)) {
    config.url = config.url.replace(`${API_URL}`, API_URL);
  }
  return config;
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Global Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', margin: '2rem', background: '#ffebee', border: '2px solid #c62828', borderRadius: '8px', color: '#c62828', fontFamily: 'sans-serif' }}>
          <h2>Oops! L'application a planté (Écran blanc)</h2>
          <p><strong>Erreur:</strong> {this.state.error?.toString()}</p>
          <pre style={{ background: 'rgba(255,255,255,0.5)', padding: '1rem', overflowX: 'auto', fontSize: '12px' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
