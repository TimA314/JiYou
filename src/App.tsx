import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { SimplePool } from 'nostr-tools';
import { Container, createTheme } from '@mui/material';
import Keys from './components/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';

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
  const [pk, setPk] = useState<string>("");
  const { relays, updateRelays } = useRelays({ pool, pk });
  const [publicKeyClicked, setPublicKeyClicked] = useState<boolean>(false);
  const [customizeClicked, setCustomizeClicked] = useState<boolean>(false);
  const [aboutClicked, setAboutClicked] = useState<boolean>(false);
  const { profile, updateProfile } = useProfile({ pool, relays, pk });

  useEffect(() => {
    //setup pool
    if (!pool) {
      setPool(new SimplePool());
    }

    const getPublicKey = async () => {
      let publicKey: string = pk;
      var storedPk = localStorage.getItem("pk");
      
      if (window.nostr){
        try{
            publicKey = await window.nostr.getPublicKey();
            if (!publicKey) return;
            localStorage.setItem("pk", publicKey);
            setPk(publicKey);
          } catch {}
      }

      if (storedPk && storedPk !== "") {
        setPk(storedPk);
        return;
      }

    }

    if(pk === "") getPublicKey();

  }, [pool, pk])


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
          <Routes>
            <Route path="/profile" element={<Profile relays={relays} pool={pool} pk={pk} profile={profile} updateProfile={updateProfile} />} />
            <Route path="/relays" element={<Relays relays={relays} updateRelays={updateRelays} pool={pool} pk={pk} />} />
            <Route path="/" element={<GlobalFeed pool={pool} relays={relays} pk={pk}/>} />
          </Routes>
        <Keys publicKeyOpen={publicKeyClicked} setPublicKeyClicked={setPublicKeyClicked} pk={pk} setPk={setPk} />
        <NavBar setPublicKeyClicked={setPublicKeyClicked} setCustomizeClicked={setCustomizeClicked} setAboutClicked={setAboutClicked} profile={profile} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
