import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { Box, Container } from '@mui/material';
import Keys from './pages/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';
import { useFollowing } from './hooks/useFollowing';
import Settings from './pages/Settings';
import { useListEvents } from './hooks/useListEvents';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';
import StartingPage from './pages/StartingPage';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './redux/store';
import { generateKeyObject, generatePublicKeyOnlyObject } from './utils/miscUtils';
import { setKeys } from './redux/slices/keySlice';
import ReplyToNote from './components/ReplyToNote';
import NoteModal from './components/NoteModal';
import { AlertMessages } from './components/AlertMessages';
import { setHideExplicitContent, setImageOnlyMode } from './redux/slices/noteSlice';
import useGetZaps from './hooks/useGetZaps';
import { useGetReactions } from './hooks/useGetReactions';
import { useGetMetaData } from './hooks/useGetMetaData';
import { useProfileNotes } from './hooks/useProfileNotes';

function App() {
  const keys = useSelector((state: RootState) => state.keys);
  const note = useSelector((state: RootState) => state.note);
  const { updateRelays } = useRelays({});
  const { updateFollowing } = useFollowing({});
  const { profile, updateProfile} = useProfile({});

  // Hooks
  useListEvents({});
  useGetReactions();
  useProfileNotes();
  useGetMetaData();
  useGetZaps({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getKeyFromNostrExtension = async () => {
    const pkFromNostr = await window.nostr.getPublicKey();
    if (pkFromNostr && pkFromNostr !== "")
    {
      const newKeys = generatePublicKeyOnlyObject(pkFromNostr);
      dispatch(setKeys(newKeys));
    } else {
      navigate("/start");
    }
  }

  useEffect(() => {
    if (keys.publicKey.decoded === "") {
      
      //check if sk is in local storage
      const skFromStorage = localStorage.getItem("sk");
      
      if (skFromStorage && skFromStorage !== ""){
        const newKeys = generateKeyObject(skFromStorage);
        if (newKeys){
          store.dispatch(setKeys(newKeys));
          return;
        }
      } else {
        //check if nostr extension is installed
        if (window.nostr){
          try {
            getKeyFromNostrExtension();
          } catch {}
        } else {
          navigate("/start");
        }
      }
    }
  }, [keys.publicKey.decoded]);


  //Set Settings
  useEffect(() => {
    const settings = localStorage.getItem("JiYouSettings");
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      console.log(parsedSettings)
      if (parsedSettings){
        dispatch(setHideExplicitContent(parsedSettings.feedSettings.hideExplicitContent))
        dispatch(setImageOnlyMode(parsedSettings.feedSettings.imagesOnlyMode))
      }
    }

    const checkWebLN = async () => {

      if (typeof window.webln !== 'undefined') {
        console.log('WebLN is available!');
      }
    }
    checkWebLN();
    
  }, []);


  return (
    <Box>
      <CssBaseline />
      <ScrollToTop />
      <Container maxWidth="xl" sx={{ padding: 1 }}>
        <AlertMessages messages={note.alertMessages} />
        <ReplyToNote
          updateFollowing={updateFollowing} 
        />
        <NoteModal
          updateFollowing={updateFollowing}
        />
        <Routes>
            <Route path="/start" element={
              <StartingPage
              />} />
            <Route path="/profile" element={
              <Profile
                updateProfile={updateProfile}
              />} />
            <Route path="/relays" element={
              <Relays
                updateRelays={updateRelays}
              />} />
            <Route path="/" element={
              <GlobalFeed
                updateFollowing={updateFollowing}
              />} />
            <Route path="/keys" element={
              <Keys
              />} />
            <Route path="/settings" element={
              <Settings />
            } />
            <Route path="/about" element={
              <About />
            } />
          </Routes>
          {keys.publicKey.decoded !== "" && 
          <NavBar profile={profile} />
          }
      </Container>
    </Box>
  );
}

export default App;
