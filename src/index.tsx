import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './theme/AppThemeProvider';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { PoolContext } from './context/PoolContext';
import { SimplePool } from 'nostr-tools';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const pool = new SimplePool();

root.render(
  <React.StrictMode>
    <PoolContext.Provider value={pool}>
      <Provider store={store}>
          
        <ThemeProvider >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </PoolContext.Provider>
  </React.StrictMode>
);