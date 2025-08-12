import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import HFAlexRoot from './components/HFAlexRoot';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HFAlexRoot />
    </BrowserRouter>
  </React.StrictMode>
);
