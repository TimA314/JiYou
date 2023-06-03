import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { EventTemplate, SimplePool, getPublicKey, nip19 } from 'nostr-tools';
import { Box, Container, createTheme } from '@mui/material';
import Keys from './components/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';
import SignEventDialog from './components/SignEventDialog';


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
  const [eventToSign, setEventToSign] = useState<EventTemplate | null>(null);
  const [signEventOpen, setSignEventOpen] = useState<boolean>(false);
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [pk, setPk] = useState<string>("");
  const { relays, updateRelays, setRelays } = useRelays({ pool, pk, setEventToSign, setSignEventOpen });
  const [publicKeyClicked, setPublicKeyClicked] = useState<boolean>(false);
  const [customizeClicked, setCustomizeClicked] = useState<boolean>(false);
  const [aboutClicked, setAboutClicked] = useState<boolean>(false);
  const [willUseNostrExtension, setWillUseNostrExtension] = useState<boolean>(false);
  const { profile, updateProfile, setProfile } = useProfile({ pool, relays, pk, setEventToSign, setSignEventOpen });

  useEffect(() => {
    //setup pool
    if (!pool) {
      setPool(new SimplePool());
    }
  }, [pool])


  useEffect(() => {
    const addpublicKeyToState = async () => {
      let publicKey: string = pk;
      
      if (window.nostr){
        try{
          publicKey = await window.nostr.getPublicKey();
          if (!publicKey) return;
          setPk(publicKey);
          setWillUseNostrExtension(true);
          return;
        } catch {}
      }
      
      const storedPk = localStorage.getItem("pk");
      const decodedPk = storedPk && storedPk.length < 90 ? nip19.decode(storedPk) : null;
      if (decodedPk && decodedPk.data.toString() !== "") {
        setPk(decodedPk.data.toString());
      }

      const storedSk = localStorage.getItem("secretKey");

      const decodedSk = storedSk && storedSk.length < 90 ? nip19.decode(storedSk) : null;
      if (!decodedSk || decodedSk.data.toString() !== "") return;
      const pkFromSk = getPublicKey(decodedSk.data.toString());
      if (pkFromSk && pkFromSk !== "") {
        setPk(pkFromSk);
      }

      const encodedPk = nip19.npubEncode(pkFromSk)
      if (encodedPk !== storedPk) {
        localStorage.setItem("pk", encodedPk);
      }
    };

    addpublicKeyToState();
  }, [pool]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/profile" element={<Profile relays={relays} pool={pool} pk={pk} profile={profile} updateProfile={updateProfile}/>} />
          <Route path="/relays" element={<Relays relays={relays} updateRelays={updateRelays} pool={pool} pk={pk} />} />
          <Route path="/" element={<GlobalFeed pool={pool} relays={relays} pk={pk}/>} />
        </Routes>
        <SignEventDialog 
          signEventOpen={signEventOpen} 
          setSignEventOpen={setSignEventOpen} 
          setEventToSign={setEventToSign} 
          event={eventToSign} 
          pool={pool} 
          relays={relays} setProfile={setProfile}
          setRelays={setRelays}
          />
        <Keys publicKeyOpen={publicKeyClicked} setPublicKeyClicked={setPublicKeyClicked} pk={pk} setPk={setPk} willUseNostrExtension={willUseNostrExtension} setWillUseNostrExtension={setWillUseNostrExtension} />
        <NavBar setPublicKeyClicked={setPublicKeyClicked} setCustomizeClicked={setCustomizeClicked} setAboutClicked={setAboutClicked} profile={profile} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
