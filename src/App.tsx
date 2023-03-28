import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import './App.css';
import { Route, Routes} from 'react-router-dom';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Relays from './pages/Relays';
import NavBar from './components/NavBar';
import { useState } from 'react';
import FollowerFeed from './pages/FollowerFeed';
import GlobalFeed from './pages/GlobalFeed';

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  return (

<ThemeProvider theme={theme}>
  <CssBaseline />
  <Container>
    <Routes>
      <Route path="/" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/relays" element={<Relays />} />
      <Route path="/follower-feed" element={<FollowerFeed />} />
      <Route path="/global-feed" element={<GlobalFeed />} />
    </Routes>
    <NavBar isLoggedIn={isLoggedIn}/>
  </Container>
</ThemeProvider>
  );
}

export default App;
