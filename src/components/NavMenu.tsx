import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import TuneIcon from '@mui/icons-material/Tune';
import KeyIcon from '@mui/icons-material/Key';

interface NavMenuProps {
    setPublicKeyClicked: (publicKeyOpen: boolean) => void;
    setCustomizeClicked: (customizeOpen: boolean) => void;
    setAboutClicked: (aboutOpen: boolean) => void;
}

export default function NavMenu({setPublicKeyClicked, setCustomizeClicked, setAboutClicked}: NavMenuProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    };

    const handlePublicKeyClicked = () => {
        setPublicKeyClicked(true);
        handleClose();
    };

    const handleCustomizeClicked = () => {
        setCustomizeClicked(true);
        handleClose();
    };

    const handleAboutClicked = () => {
        setAboutClicked(true);
        handleClose();
    };

    const handleClose = () => {
    setAnchorEl(null);
    };

    return (
        <div>
            <Button
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            >
            <MenuIcon />
            </Button>
            <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
            transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
            }}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
            >
            <MenuItem onClick={handleAboutClicked}><InfoIcon /></MenuItem>
            <MenuItem onClick={handleCustomizeClicked}><TuneIcon /></MenuItem>
            <MenuItem onClick={handlePublicKeyClicked}><KeyIcon /></MenuItem>
            </Menu>
        </div>
    );
}