import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState, useRef } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { Filter } from 'nostr-tools';
import { Alert, Box, Container, Fade } from '@mui/material';
import Keys from './pages/Keys';
import { useProfile } from './hooks/useProfile';
import { useRelays } from './hooks/useRelays';
import { useFollowing } from './hooks/useFollowing';
import Settings from './pages/Settings';
import { useListEvents } from './hooks/useListEvents';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';
import StartingPage from './pages/StartingPage';
import { getDefaultFeedFilter } from './nostr/FeedEvents';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './redux/store';
import { generateKeyObject, generatePublicKeyOnlyObject } from './utils/miscUtils';
import { setKeys } from './redux/slices/keySlice';
import ReplyToNote from './components/ReplyToNote';
import NoteModal from './components/NoteModal';

function App() {
  const keys = useSelector((state: RootState) => state.keys);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fetchEvents, setFetchEvents] = useState(false);
  const fetchingEventsInProgress = useRef(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const { updateRelays } = useRelays({ setFetchEvents});
  const { updateFollowing, following, followers } = useFollowing({});
  const defaultFilter = getDefaultFeedFilter(hashtags, tabIndex, following);
  const filterForFeed = useRef<Filter>(defaultFilter);
  const { profile, updateProfile} = useProfile({});
  const hideExplicitContent = useRef<boolean>(true);
  const imagesOnlyMode = useRef<boolean>(false);
  const { } = useListEvents({ 
      tabIndex, 
      following, 
      hashtags,
      hideExplicitContent,
      imagesOnlyMode,
      fetchEvents,
      setFetchEvents,
      fetchingEventsInProgress,
      filter: filterForFeed.current
    });
    const dispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(() => {
      if (keys.publicKey.decoded === "") {

        const getKeyFromNostrExtension = async () => {
          const pkFromNostr = await window.nostr.getPublicKey();
          if (pkFromNostr && pkFromNostr !== "")
          {
            const newKeys = generatePublicKeyOnlyObject(pkFromNostr);
            dispatch(setKeys(newKeys));
            return true;
          }
          return false;
        }


        if (window.nostr){
          try {
            const retrieved = getKeyFromNostrExtension();
          } catch {}
        }


        //check if sk is in local storage
        const skFromStorage = localStorage.getItem("sk");

        if (skFromStorage && skFromStorage !== ""){
            const newKeys = generateKeyObject(skFromStorage);
            if (newKeys){
              store.dispatch(setKeys(newKeys));
              return;
          }
        }

        navigate("/start");
      }
    }, [keys.publicKey.decoded]);

  //Get Feed Events
  useEffect(() => {
    setFetchEvents(true);
  }, []);

  //Clear Alert (error message)
  useEffect(() => {
    if (errorMessage === "") return;
    const timeoutId = setTimeout(() => setErrorMessage(""), 3000);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  //Set Settings
  useEffect(() => {
    const settings = localStorage.getItem("JiYouSettings");

    if (settings) {
      const parsedSettings = JSON.parse(settings);
      hideExplicitContent.current = parsedSettings?.feedSettings?.hideExplicitContent ?? true
      imagesOnlyMode.current = parsedSettings?.feedSettings?.imagesOnlyMode ?? false;
    }
  }, []);

  return (
    <Box>
      <CssBaseline />
      <ScrollToTop />
      <Container>
      <Fade in={errorMessage !== ""}>
        <Alert 
            sx={{
                position: 'fixed',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1500,
                maxWidth: '90%',
            }}
            severity="error"
        >
            {errorMessage}
        </Alert>
    </Fade>
      <ReplyToNote
        fetchEvents={fetchEvents}
        setFetchEvents={setFetchEvents}
        following={following} 
        updateFollowing={updateFollowing} 
        setHashtags={setHashtags}
        hashTags={hashtags}
        imagesOnlyMode={imagesOnlyMode}
      />
      <NoteModal
        fetchEvents={fetchEvents}
        setFetchEvents={setFetchEvents}
        following={following}
        updateFollowing={updateFollowing}
        setHashtags={setHashtags}
        hashTags={hashtags}
        imagesOnlyMode={imagesOnlyMode}
      />
      <Routes>
          <Route path="/start" element={
            <StartingPage
              setErrorMessage={setErrorMessage}
            />} />
          <Route path="/profile" element={
            <Profile
              fetchEvents={fetchEvents}
              setFetchEvents={setFetchEvents}
              following={following}
              followers={followers}
              updateProfile={updateProfile}
              imagesOnlyMode={imagesOnlyMode}
              hideExplicitContent={hideExplicitContent}
            />} />
          <Route path="/relays" element={
            <Relays
              updateRelays={updateRelays}
            />} />
          <Route path="/" element={
            <GlobalFeed
              following={following}
              updateFollowing={updateFollowing}
              hideExplicitContent={hideExplicitContent}
              imagesOnlyMode={imagesOnlyMode}
              fetchEvents={fetchEvents}
              setFetchEvents={setFetchEvents}
              filter={filterForFeed}
              fetchingEventsInProgress={fetchingEventsInProgress}
              setTabIndex={setTabIndex}
              hashtags={hashtags}
              setHashtags={setHashtags}
              tabIndex={tabIndex}
            />} />
          <Route path="/keys" element={
            <Keys
            />} />
          <Route path="/settings" element={
            <Settings
              imagesOnlyMode={imagesOnlyMode}
              hideExplicitContent={hideExplicitContent}
              setFetchEvents={setFetchEvents}
            />
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
