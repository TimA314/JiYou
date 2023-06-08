import * as React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import CellTowerIcon from '@mui/icons-material/CellTower';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import "./NavBar.css";
import NavMenu from './NavMenu';
import { Avatar } from '@mui/material';
import { ProfileContent } from '../nostr/Types';

interface NavBarProps {
  profile: ProfileContent
}

const NavBar = ({profile}: NavBarProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.ownerDocument.body.scrollTop = 0;
    }
  }, []);

  return (
<Box sx={{ pb: 7 }} ref={ref}>
  <Paper className="navbar" >
      <NavMenu />
      <Link className="nav-link" to="/">
        <DynamicFeedIcon color="primary"/>
      </Link>
      <Link  className="nav-link" to="/relays">
        <CellTowerIcon color="primary"/>
      </Link>
      <Link  className="nav-link" to="/profile">
        {profile.picture !== "" ? <Avatar src={profile.picture} /> : <AccountCircleIcon color="primary" />}
      </Link>
  </Paper>
</Box>
  );
};

export default NavBar;