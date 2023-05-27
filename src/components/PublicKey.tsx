import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { nip19 } from 'nostr-tools';
import { createCookie } from '../utils/miscUtils';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "95%",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface PublicKeyProps {
    setPublicKeyClicked: (publicKeyOpen: boolean) => void;
    publicKeyOpen: boolean;
    pk: string;
    setPk: (pk: string) => void;
}

export default function PublicKey({setPublicKeyClicked, publicKeyOpen, pk, setPk}: PublicKeyProps) {
  const [localPk, setLocalPk] = useState(pk);

  useEffect(() => {
    setLocalPk(nip19.npubEncode(pk));
  }, [pk]);

  const handleSave = () => {
    if (localPk.trim() === "") return;
  
    if (!localPk.startsWith("npub")){
      alert("Public key should start with 'npub'.");
      return;
    }
  
    try{
      var decodedPk = nip19.decode(localPk.trim());
      
      if (decodedPk === null) {
        alert("Invalid public key.");
        return;
      }
      
      createCookie("pk", decodedPk.data.toString(), 30);
      handleClose();
      setPk(decodedPk.data.toString());

    } catch {
      alert("Invalid public key.");
      return;
    }
  };

  const handleClose = () => {
    setPublicKeyClicked(false);
    };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPk(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSave();
  };

  return (
    <div>
      <Modal
        open={publicKeyOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
        <Box sx={{position: 'absolute', top: 8, right: 8}}>
            <ClearIcon style={{cursor: 'pointer'}} onClick={handleClose} />
        </Box>
          <Typography id="pkTitle" variant="h6" color="Secondary" component="h2" marginBottom="5px">
            Public Key
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField id="publicKeyInput" label="npub..." variant="outlined" value={localPk} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" type="submit" startIcon={<SaveIcon />}>Save</Button>
              </Grid>
            </Grid>
          </form>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            This is your public key. You can share this with others. Your public key will be stored in a cookie within your browser. It will be used to get your profile and other settings.
            </Typography>
        </Box>
      </Modal>
    </div>
  );
}
