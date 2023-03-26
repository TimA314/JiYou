import * as React from 'react';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import { MoreVert } from '@mui/icons-material';
import { Button } from '@mui/material';
import { EventWithProfile } from '../nostr/Types';

interface DropDownProps {
    event: EventWithProfile;
}

export default function DropDown(props: DropDownProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: React.MouseEventHandler<HTMLButtonElement> | undefined) => {

  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <Box>
      <Button aria-describedby={id} type="button">
        <MoreVert />
      </Button>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          <Button>{props.event.isFollowing ? "Unfollow" : "Follow"}</Button>
        </Box>
      </Popper>
    </Box>
  );
}