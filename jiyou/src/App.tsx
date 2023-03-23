import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/system';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import './App.css';
import { Route, Routes} from 'react-router-dom';
import SignIn from './pages/SignIn';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8E5AC3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (

<ThemeProvider theme={theme}>
  <CssBaseline />
  <Container>
    <Routes>
      <Route path="/" element={<SignIn/>} />
    </Routes>
  </Container>
</ThemeProvider>
  );
}

export default App;
