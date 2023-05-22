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
import { useFollowers } from './hooks/useFollowers';

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
  const [pk, setPk] = useState<string>("");


  useEffect(() => {
    //setup pool
    const _pool = new SimplePool()
    setPool(_pool);

    const getPublicKey = async () => {
      if (window.nostr){
        const publicKey = await window.nostr.getPublicKey();
        if (publicKey) setPk(publicKey);
      }
    }
    getPublicKey();

    return () => {
      pool?.close(defaultRelays)
    }

  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
          <Routes>
            <Route path="/profile" element={<Profile relays={relayArray} pool={pool} pk={pk} />} />
            <Route path="/relays" element={<Relays relays={relayArray.length > 0 ? relayArray : defaultRelays} setRelayArray={setRelayArray} pool={pool} pk={pk} />} />
            <Route path="/" element={<GlobalFeed pool={pool} relays={relayArray} pk={pk}/>} />
            <Route path="/newNote" element={<CreateNote pool={pool} relays={relayArray} pk={pk} />} />
          </Routes>
        <NavBar />
      </Container>
    </ThemeProvider>
  );
}

export default App;
