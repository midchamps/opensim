import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tailwind.css';
import { App } from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('OpenSim: #root element not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
