import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ChatWindow } from './components/ChatWindow';

// Create a professional enterprise-grade theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Enterprise Blue
    },
    background: {
      default: '#f0f2f5', // Soft gray background
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase standard
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatWindow />
    </ThemeProvider>
  );
};

export default App;
