import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Grid, Divider, Stack, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { nip19 } from 'nostr-tools';
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';


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

interface KeysProps {
    setPublicKeyClicked: (publicKeyOpen: boolean) => void;
    publicKeyOpen: boolean;
    pk: string;
    setPk: (pk: string) => void;
}

export default function Keys({setPublicKeyClicked, publicKeyOpen, pk, setPk}: KeysProps) {
  const [localPk, setLocalPk] = useState(pk);
  const [localSecretKey, setLocalSecretKey] = useState("");

  useEffect(() => {
    setLocalPk(nip19.npubEncode(pk));
  }, [pk]);

  useEffect(() => {
   
    try {
    var secretKey = localStorage.getItem("SecretKey");
    if (!secretKey) return;

      var decodedSecretKey = nip19.decode(secretKey)
      if (decodedSecretKey) {
        setLocalSecretKey(secretKey);
      }

    } catch {
      return;
    }

  }, []);

  const handleSaveSecretKey = () => {
  
    if (!localSecretKey.startsWith("nsec")){
      alert("Secret key should start with 'nsec'.");
      return;
    }
  
    try{
      var decodedSecretKey = nip19.decode(localSecretKey.trim());
      
      if (!decodedSecretKey) {
        alert("Invalid secret key.");
        return;
      }
      
      localStorage.setItem("SecretKey", localSecretKey.trim());
      handleClose();

    } catch {
      alert("Error, Key NOT saved.");
      return;
    }
  };

  const handleSavePubKey = () => {
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
      
      console.log(decodedPk.data.toString());
      localStorage.setItem("pk", decodedPk.data.toString());
      setPk(decodedPk.data.toString());
      handleClose();

    } catch {
      alert("Invalid public key.");
      return;
    }
  };

  const handleClose = () => {
    setPublicKeyClicked(false);
    };
  
  const handlePkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPk(event.target.value);
  };

  const handleSecretKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSecretKey(event.target.value);
  };

  const handlePkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSavePubKey();
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
        <Box>

        <Paper elevation={3} style={{padding: '10px', margin: '10px', textAlign: 'center'}}>
          <Box>
            <Stack flexDirection="row" direction='row' spacing="2" justifyContent="space-between">
              <WarningIcon color='warning'/>
              <WarningIcon color='warning'/>
            </Stack>
          </Box>
          <Typography fontSize="small" textAlign="center">
            <strong style={{color: "red"}}> IT IS HIGHLY RECCOMENDED TO USE A NOSTR EXTENSION TO HANDLE YOUR SECRET KEY.</strong>
          </Typography>
          <Box>
            <Stack flexDirection="row" direction='row' spacing="2" justifyContent="space-between">
              <WarningIcon color='warning'/>
              <WarningIcon color='warning'/>
            </Stack>
          </Box>
        </Paper>
          <Typography id="pkTitle" variant="h6" color="Secondary" component="h2" marginBottom="5px">
            Secret Key
          </Typography>
          <form onSubmit={handleSaveSecretKey}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField id="secretKeyInput" label="nsec..." variant="outlined" value={localSecretKey} onChange={handleSecretKeyChange} fullWidth />
              </Grid>
              <Grid item>
                <Button variant="contained" color="secondary" type="submit" startIcon={<SaveIcon />}>Save</Button>
              </Grid>
            </Grid>
          </form>
          <Typography id="modal-modal-description" color="warning" sx={{ mt: 2}}>
            This is your secret key. <strong style={{color: "red"}}>DO NOT</strong> share this with others. Your private key will be stored within your browser's local storage. It will be used to sign events. <br/> 
            </Typography>
        </Box>

        <Divider sx={{marginTop: 2, marginBottom: 2}}/>

          <Typography id="pkTitle" variant="h6" color="Secondary" component="h2" marginBottom="5px">
            Public Key
          </Typography>
          <form onSubmit={handlePkSubmit}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField id="publicKeyInput" label="npub..." variant="outlined" value={localPk} onChange={handlePkChange} fullWidth />
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" type="submit" startIcon={<SaveIcon />}>Save</Button>
              </Grid>
            </Grid>
          </form>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            This is your public key. You can share this with others. Your public key will be stored within your browser's local storage. It will be used to get your profile and other settings.
            </Typography>
        </Box>
      </Modal>
    </div>
  );
}
