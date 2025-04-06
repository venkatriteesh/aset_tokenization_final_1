import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './Dashboard'; // Updated to default import
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
);
