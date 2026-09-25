import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import './styles/tokens.css';
import './styles/global.css';
import { AuthProvider } from './lib/auth.jsx';
import { ToastProvider, ErrorBoundary } from './components/ui/index.jsx';
import Router from './app/router.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ErrorBoundary><BrowserRouter><ToastProvider><AuthProvider><Router /></AuthProvider></ToastProvider></BrowserRouter></ErrorBoundary></React.StrictMode>,
);
