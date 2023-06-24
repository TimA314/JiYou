import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState, useCallback, useRef } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { EventTemplate, SimplePool, getPublicKey, nip19 } from 'nostr-tools';
import { Box, Container } from '@mui/material';
import Keys from './pages/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';
import SignEventDialog from './components/SignEventDialog';
import { useFollowing } from './hooks/useFollowing';
import Settings from './pages/Settings';
import { useListEvents } from './hooks/useListEvents';

function App() {
  const [eventToSign, setEventToSign] = useState<EventTemplate | null>(null);
  const [signEventOpen, setSignEventOpen] = useState<boolean>(false);
  const [pool] = useState<SimplePool>(() => new SimplePool());
  const [pk, setPk] = useState<string>("");
  const { relays, updateRelays, setRelays } = useRelays({ pool, pk, setEventToSign, setSignEventOpen });
  const [publicKeyClicked, setPublicKeyClicked] = useState<boolean>(false);
  const [willUseNostrExtension, setWillUseNostrExtension] = useState<boolean>(false);
  const { profile, updateProfile, setProfile } = useProfile({ pool, relays, pk, setEventToSign, setSignEventOpen });
  const { updateFollowing, following } = useFollowing({ pool, relays, pk, setEventToSign, setSignEventOpen });
  const [hideExplicitContent, setHideExplicitContent] = useState<boolean>(true);
  const [imagesOnlyMode, setImagesOnlyMode] = useState<boolean>(false);
  const fetchEvents = useRef(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const { events } = useListEvents({ 
      pool, 
      relays, 
      tabIndex, 
      following, 
      hashtags,
      hideExplicitContent,
      imagesOnlyMode,
      fetchEvents    
    });

  const addPublicKeyToState = useCallback(async () => {
    let publicKey: string = pk;

    if (window.nostr) {
      try {
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
    } else {
      const storedSk = localStorage.getItem("secretKey");
      const decodedSk = storedSk && storedSk.length < 90 ? nip19.decode(storedSk) : null;

      if (!decodedSk || decodedSk.data.toString() !== "") return;

      const pkFromSk = getPublicKey(decodedSk.data.toString());

      if (pkFromSk && pkFromSk !== "") {
        setPk(pkFromSk);
      }

      const encodedPk = nip19.npubEncode(pkFromSk);

      if (encodedPk !== storedPk) {
        localStorage.setItem("pk", encodedPk);
      }
    }
  }, [pk]);

  useEffect(() => {
    fetchEvents.current = true;
  }, []);
  
  useEffect(() => {
    addPublicKeyToState();
  }, [addPublicKeyToState]);

  useEffect(() => {
    const settings = localStorage.getItem("JiYouSettings");

    if (settings) {
      const parsedSettings = JSON.parse(settings);
      setHideExplicitContent(parsedSettings?.feedSettings?.hideExplicitContent ?? true);
      setImagesOnlyMode(parsedSettings?.feedSettings?.imagesOnlyMode ?? false);
    }
  }, []);

  return (
    <Box>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/profile" element={
            <Profile
              relays={relays}
              pool={pool}
              pk={pk}
              following={following}
              profile={profile}
              updateProfile={updateProfile}
              setEventToSign={setEventToSign}
              setSignEventOpen={setSignEventOpen}
            />} />
          <Route path="/relays" element={
            <Relays
              relays={relays}
              updateRelays={updateRelays}
              pool={pool}
              pk={pk}
            />} />
          <Route path="/" element={
            <GlobalFeed
              pool={pool}
              relays={relays}
              pk={pk}
              following={following}
              setEventToSign={setEventToSign}
              setSignEventOpen={setSignEventOpen}
              updateFollowing={updateFollowing}
              hideExplicitContent={hideExplicitContent}
              imagesOnlyMode={imagesOnlyMode}
              events={events}
              fetchEvents={fetchEvents}
              setTabIndex={setTabIndex}
              hashtags={hashtags}
              setHashtags={setHashtags}
              tabIndex={tabIndex}
            />} />
          <Route path="/keys" element={
            <Keys
              publicKeyOpen={publicKeyClicked}
              pk={pk}
              setPk={setPk}
              willUseNostrExtension={willUseNostrExtension}
              setWillUseNostrExtension={setWillUseNostrExtension}
            />} />
          <Route path="/settings" element={
            <Settings
              imagesOnlyMode={imagesOnlyMode}
              setImagesOnlyMode={setImagesOnlyMode}
              hideExplicitContent={hideExplicitContent}
              setHideExplicitContent={setHideExplicitContent}
            />
          } />
        </Routes>
        <SignEventDialog
          signEventOpen={signEventOpen}
          setSignEventOpen={setSignEventOpen}
          setEventToSign={setEventToSign}
          event={eventToSign}
          pool={pool}
          relays={relays}
          setProfile={setProfile}
          setRelays={setRelays}
        />
        <NavBar
          profile={profile}
        />
      </Container>
    </Box>
  );
}

export default App;
