import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState, useCallback, useRef } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { SimplePool, generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools';
import { Box, Container } from '@mui/material';
import Keys from './pages/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';
import { useFollowing } from './hooks/useFollowing';
import Settings from './pages/Settings';
import { useListEvents } from './hooks/useListEvents';
import About from './pages/About';

function App() {
  const [pool, setPool] = useState<SimplePool>(() => new SimplePool());
  const [sk_decoded, setSk_decoded] = useState<string>("");
  const [pk_decoded, setPk_decoded] = useState<string>("");
  const { relays, updateRelays } = useRelays({ pool, pk_decoded});
  const [publicKeyClicked, setPublicKeyClicked] = useState<boolean>(false);
  const [willUseNostrExtension, setWillUseNostrExtension] = useState<boolean>(false);
  const { profile, updateProfile, getProfile} = useProfile({ pool, relays, pk_decoded });
  const { updateFollowing, following } = useFollowing({ pool, relays, pk_decoded });
  const [hideExplicitContent, setHideExplicitContent] = useState<boolean>(true);
  const [imagesOnlyMode, setImagesOnlyMode] = useState<boolean>(false);
  const fetchEvents = useRef(false);
  const fetchingEventsInProgress = useRef(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const { events } = useListEvents({ 
      pool,
      setPool, 
      relays, 
      tabIndex, 
      following, 
      hashtags,
      hideExplicitContent,
      imagesOnlyMode,
      fetchEvents,
      fetchingEventsInProgress  
    });

  const addKeysToState = useCallback(async () => {
    let publicKey: string = pk_decoded;

    //Check Nostr Extension for Public Key
    if (window.nostr) {
      try {
        publicKey = await window.nostr.getPublicKey();
        if (!publicKey) return;
        setPk_decoded(publicKey);
        setWillUseNostrExtension(true);
        return;
      } catch {}
    }

    //Check Local Storage for Keys
    const storedSk = localStorage.getItem("secretKey") || "";
    const storedPk = localStorage.getItem("pk") || "";


    //If no keys in local storage, generate a new keys
    if (storedSk === "" && storedPk === "") {
      const sk = generatePrivateKey();
      const encodedSk = nip19.nsecEncode(sk);
      localStorage.setItem("sk", encodedSk);
      setSk_decoded(sk);

      publicKey = getPublicKey(sk);
      const encodedPk = nip19.npubEncode(publicKey);
      localStorage.setItem("pk", encodedPk);
      setPk_decoded(publicKey);
      return;
    }

    //Check Keys in Local Storage
    const decodedSk = storedSk && storedSk.length < 90 ? nip19.decode(storedSk) : null;
    const decodedPk = storedPk && storedPk.length < 90 ? nip19.decode(storedPk) : null;

    if (decodedPk && decodedPk.data.toString() !== "") {

      //If Pk is good set to state
      setPk_decoded(decodedPk.data.toString());
      
    } else {

      //If Pk is bad, check if Sk is good
      if (decodedSk && decodedSk.data.toString() !== ""){
        
        setSk_decoded(decodedSk.data.toString());
        const pkFromSk = getPublicKey(decodedSk.data.toString());
        if (pkFromSk && pkFromSk !== "") {
          setPk_decoded(pkFromSk);
        }
        
        const encodedPk = nip19.npubEncode(pkFromSk);
        if (encodedPk !== storedPk) {
          localStorage.setItem("pk", encodedPk);
        }
      }

    }
  }, []);

  useEffect(() => {
    fetchEvents.current = true;
  }, []);

  useEffect(() => {
    addKeysToState();
  }, [addKeysToState]);

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
              fetchEvents={fetchEvents}
              pool={pool}
              pk={pk_decoded}
              following={following}
              profile={profile}
              updateProfile={updateProfile}
              getProfile={getProfile}
            />} />
          <Route path="/relays" element={
            <Relays
              relays={relays}
              updateRelays={updateRelays}
              pool={pool}
              pk={pk_decoded}
            />} />
          <Route path="/" element={
            <GlobalFeed
              pool={pool}
              relays={relays}
              pk={pk_decoded}
              following={following}
              updateFollowing={updateFollowing}
              hideExplicitContent={hideExplicitContent}
              imagesOnlyMode={imagesOnlyMode}
              events={events}
              fetchEvents={fetchEvents}
              fetchingEventsInProgress={fetchingEventsInProgress}
              setTabIndex={setTabIndex}
              hashtags={hashtags}
              setHashtags={setHashtags}
              tabIndex={tabIndex}
            />} />
          <Route path="/keys" element={
            <Keys
              publicKeyOpen={publicKeyClicked}
              pk={pk_decoded}
              setPk={setPk_decoded}
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
          <Route path="/about" element={
            <About />
          } />
        </Routes>
        <NavBar
          profile={profile}
        />
      </Container>
    </Box>
  );
}

export default App;
