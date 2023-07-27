import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useEffect, useState, useRef } from 'react';
import GlobalFeed from './pages/GlobalFeed';
import { SimplePool, nip19, Event, Filter } from 'nostr-tools';
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
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './redux/store';
import { generateKeyObject } from './utils/miscUtils';
import { setKeys } from './redux/slices/keySlice';

function App() {
  const publicKey = useSelector((state: RootState) => state.keys.publicKey);
  const privateKey = useSelector((state: RootState) => state.keys.privateKey);
  const [sk_decoded, setSk_decoded] = useState<string>("");
  const [pk_decoded, setPk_decoded] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fetchEvents, setFetchEvents] = useState(false);
  const fetchingEventsInProgress = useRef(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [pool, setPool] = useState<SimplePool>(() => new SimplePool());
  const { relays, setRelays, updateRelays } = useRelays({ pool, pk_decoded, sk_decoded, setFetchEvents});
  const { updateFollowing, following, followers } = useFollowing({ pool, relays, pk_decoded, sk_decoded });
  const defaultFilter = getDefaultFeedFilter(hashtags, tabIndex, following);
  const filterForFeed = useRef<Filter>(defaultFilter);
  const { profile, updateProfile, getProfile} = useProfile({ pool, relays, pk_decoded, sk_decoded });
  const hideExplicitContent = useRef<boolean>(true);
  const imagesOnlyMode = useRef<boolean>(false);
  const { feedEvents, rootEvents, replyEvents, reactions, metaData} = useListEvents({ 
      pool,
      setPool, 
      relays, 
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

    const navigate = useNavigate();

    useEffect(() => {
      if (publicKey.decoded === "") {

        //check if sk is in local storage
        const skFromStorage = localStorage.getItem("sk");

        if (skFromStorage && skFromStorage !== ""){
            const newKeys = generateKeyObject(skFromStorage);
            if (newKeys){
              store.dispatch(setKeys(newKeys));
              return;
          }
        }

        //check if pk is in local storage
        const pkFromStorage = localStorage.getItem("pk");
        
        if (pkFromStorage && pkFromStorage !== ""){
          const decodedPkFromStorage = nip19.decode(pkFromStorage);
          if (decodedPkFromStorage && decodedPkFromStorage.data.toString() !== ""){
            setPk_decoded(decodedPkFromStorage.data.toString());
            return;
          }
        }

        navigate("/start");
      }
    }, [pk_decoded]);

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
      <Provider store={store}>
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
        <Routes>
          <Route path="/start" element={
            <StartingPage
              setErrorMessage={setErrorMessage}
            />} />
          <Route path="/profile" element={
            <Profile
              setPk_decoded={setPk_decoded}
              setSk_decoded={setSk_decoded}
              pk_decoded={pk_decoded}
              sk_decoded={sk_decoded}
              relays={relays}
              fetchEvents={fetchEvents}
              setFetchEvents={setFetchEvents}
              pool={pool}
              setPool={setPool}
              following={following}
              followers={followers}
              profile={profile}
              updateProfile={updateProfile}
              getProfile={getProfile}
              imagesOnlyMode={imagesOnlyMode}
              hideExplicitContent={hideExplicitContent}
            />} />
          <Route path="/relays" element={
            <Relays
              relays={relays}
              updateRelays={updateRelays}
              relaysAndSetting={relays}
              setRelaysAndSetting={setRelays}
            />} />
          <Route path="/" element={
            <GlobalFeed
              pool={pool}
              relays={relays}
              pk={pk_decoded}
              sk_decoded={sk_decoded}
              following={following}
              updateFollowing={updateFollowing}
              hideExplicitContent={hideExplicitContent}
              imagesOnlyMode={imagesOnlyMode}
              feedEvents={feedEvents}
              rootEvents={rootEvents}
              replyEvents={replyEvents}
              reactions={reactions}
              metaData={metaData}
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
              pk={pk_decoded}
              sk={sk_decoded}
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
        {pk_decoded !== "" && 
        <NavBar profile={profile} />
        }
      </Container>
      </Provider>
    </Box>
  );
}

export default App;
