// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Define a basic Material-UI theme
const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
