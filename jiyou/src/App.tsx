import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/system';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import './App.css';
import { Route, Routes} from 'react-router-dom';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Relays from './pages/Relays';

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
  return (

<ThemeProvider theme={theme}>
  <CssBaseline />
  <Container>
    <Routes>
      <Route path="/" element={<SignIn/>} />
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/relays" element={<Relays />} />
    </Routes>
  </Container>
</ThemeProvider>
  );
}

export default App;
