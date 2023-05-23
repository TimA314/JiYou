import * as React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import CellTowerIcon from '@mui/icons-material/CellTower';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import "./NavBar.css";


const NavBar = () => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.ownerDocument.body.scrollTop = 0;
    }
  }, []);

  return (
<Box sx={{ pb: 7 }} ref={ref}>
  <Paper className="navbar" >
      <Link className="nav-link" to="#">
        <DynamicFeedIcon />
      </Link>
      <Link  className="nav-link" to="/relays">
        <CellTowerIcon />
      </Link>
      <Link  className="nav-link" to="/profile">
     <AccountCircleIcon />
      </Link>
      <Link className="nav-link" to="/">
        <MenuIcon/>
      </Link>
  </Paper>
</Box>
  );
};

export default NavBar;