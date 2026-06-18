import React from 'react';
import ReactDOM from 'react-dom/client';
import { PantSegBolsines } from './screens/PantSegBolsines';
// @ts-ignore: side-effect import for CSS file without type declarations
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PantSegBolsines />
  </React.StrictMode>
);
