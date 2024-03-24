import * as React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import CellTowerIcon from '@mui/icons-material/CellTower';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Link, useNavigate } from 'react-router-dom';
import "./NavBar.css";
import NavMenu from './NavMenu';
import { Avatar, IconButton } from '@mui/material';
import { setProfileToShow } from '../redux/slices/noteSlice';
import { useDispatch } from 'react-redux';
import { MetaData } from '../nostr/Types';

interface NavBarProps {
  profile: MetaData;
}

const NavBar = ({profile}: NavBarProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (ref.current) {
      ref.current.ownerDocument.body.scrollTop = 0;
    }
  }, [profile]);

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
      <IconButton  className="nav-link" onClick={() => {
        dispatch(setProfileToShow(null));
        navigate("/profile");
      }}>
        {profile.picture !== "" ? <Avatar src={profile.picture} /> : <AccountCircleIcon color="primary" />}
      </IconButton>
  </Paper>
</Box>
  );
};

export default NavBar;