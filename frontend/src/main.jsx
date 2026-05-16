import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                borderRadius: '10px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: {
                iconTheme: {
                  primary: '#28C7D9',
                  secondary: '#0D2A44',
                },
              },
              error: {
                iconTheme: {
                  primary: '#F04A2A',
                  secondary: '#fff',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);