import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import CreateNote from './pages/CreateNote';
import { SimplePool } from 'nostr-tools';
import { defaultRelays } from './nostr/Relays';
import { Container, createTheme } from '@mui/material';

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
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [relayArray, setRelayArray] = useState<string[]>(defaultRelays);

  useEffect(() => {
    //setup pool
    const _pool = new SimplePool()
    setPool(_pool);

    return () => {
      pool?.close(defaultRelays)
    }

  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
          <Routes>
            <Route path="/profile" element={<Profile relays={relayArray} pool={pool} />} />
            <Route path="/relays" element={<Relays relays={relayArray.length > 0 ? relayArray : defaultRelays} setRelayArray={setRelayArray} pool={pool} />} />
            <Route path="/" element={<GlobalFeed pool={pool} relays={relayArray} />} />
            <Route path="/newNote" element={<CreateNote pool={pool} relays={relayArray} />} />
          </Routes>
        <NavBar />
      </Container>
    </ThemeProvider>
  );
}

export default App;
