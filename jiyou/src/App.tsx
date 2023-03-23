import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/system';
import React from 'react';

import './App.css';

function App() {
  return (

<ThemeProvider theme={theme}>
  <CssBaseline />
  <Container>
    
  </Container>
</ThemeProvider>
  );
}

export default App;
