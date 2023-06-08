import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './theme/AppThemeProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
        <ThemeProvider >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
  </React.StrictMode>
);