import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/styles/index.css';
import { App } from '../../src/app/App';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App initialSlug="hondentrimsalon-finn" isStandalone={true} />
    </React.StrictMode>
  );
}
