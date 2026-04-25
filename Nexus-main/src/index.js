import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Asegúrate de poner el .jsx
import './index.css';
import { setupAxiosInterceptors } from './utils/auth'; // Configura los interceptores de axios para manejo automático de tokens y logout
setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);