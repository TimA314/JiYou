import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { TextField, Grid, Divider, Stack, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import {nip19, generatePrivateKey, getPublicKey} from 'nostr-tools'
import { useEffect, useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import WarningIcon from '@mui/icons-material/Warning';
import CelebrationIcon from '@mui/icons-material/Celebration';


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
    willUseNostrExtension: boolean;
    setWillUseNostrExtension: (willUseNostrExtension: boolean) => void;
}

export default function Keys({setPublicKeyClicked, publicKeyOpen, willUseNostrExtension, setPk, pk, setWillUseNostrExtension}: KeysProps) {
  const [localPk, setLocalPk] = useState("");
  const [localSecretKey, setLocalSecretKey] = useState("");

  useEffect(() => {
    const getNostrPublicKey = async () => {
      if (!window.nostr) return false;
      
      try{
        //Get pk from nostr extension
        var pkFromNostr = await window.nostr.getPublicKey();
        if (!pkFromNostr) return false;
        setWillUseNostrExtension(true);
        var encodedPk = nip19.npubEncode(pkFromNostr);
        if(pkFromNostr && encodedPk && encodedPk.startsWith("npub")) {
          setLocalPk(encodedPk);
          setPk(pkFromNostr);
          return true;
        }
      } catch { 
        return false;
      }
    }

    const setKey = async () => {
      const retrievedPK = await getNostrPublicKey();
      if (retrievedPK) {
        return;
      }

      //Get secret key from local storage
      try {
        var secretKey = localStorage.getItem("sk");

        if (secretKey && nip19.decode(secretKey)) {
          setLocalSecretKey(secretKey);
          setLocalPk(nip19.npubEncode(getPublicKey(nip19.decode(secretKey).data.toString())));
          return;
        }

      } catch {}

      try {
        var pkStored = localStorage.getItem("pk");
        console.log(pkStored);
        var encoded =  pkStored ? nip19.npubEncode(pkStored!) : null;
        if (pkStored && encoded){
          setLocalPk(encoded);
          setPk(pkStored)
        }
      } catch {}
    }
    
    if (localPk === ""){
      setKey();
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
      
      localStorage.setItem("sk", localSecretKey.trim());
      var pubKeyFromSk = nip19.npubEncode(getPublicKey(decodedSecretKey.data.toString()));
      setLocalPk(pubKeyFromSk);
      localStorage.setItem("pk", pubKeyFromSk);
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

      if (!nip19.decode(localPk.trim())) {
        alert("Invalid public key.");
        return;
      }
      
      localStorage.setItem("pk", localPk.trim());
      handleClose();

    } catch (error){
      alert("Invalid public key." + error);
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
    event.preventDefault();
    setLocalSecretKey(event.target.value);
  };

  const handlePkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSavePubKey();
  };

  const generateNewKeys = () => {
    var sk = generatePrivateKey();
    var pk = getPublicKey(sk);

    var encodedPk = nip19.npubEncode(pk);
    setLocalPk(encodedPk);
    setPk(pk);
    localStorage.setItem("pk", encodedPk);
    
    var encodedSk = nip19.nsecEncode(sk);
    setLocalSecretKey(encodedSk);
    localStorage.setItem("sk", encodedSk);
  }

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
          {willUseNostrExtension ?
            <Paper sx={{padding: "10px"}}>
              <Stack flexDirection="row" direction='row' spacing="2" justifyContent="center">
                <CelebrationIcon color='success'/>
                <CelebrationIcon color='success'/>
                <CelebrationIcon color='success'/>
              </Stack>
              <Typography id="modal-modal-title" variant="h6" color="success" component="h2" textAlign="center" marginBottom="5px">
                Good Job using a Nostr Extension! Your Secret Key will not be stored here.
              </Typography> 
            </Paper>
              :  
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
                      <TextField disabled={willUseNostrExtension} id="secretKeyInput" label="nsec..." variant="outlined" color="secondary" value={localSecretKey} onChange={handleSecretKeyChange} fullWidth />
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
      }

        {!willUseNostrExtension &&
        <Box>
          <Divider sx={{marginTop: 2, marginBottom: 2}}/>
          <Button variant="contained" color="warning" type="button" onClick={generateNewKeys}>Generate New Keys</Button>
          <Divider sx={{marginTop: 2, marginBottom: 2}}/>
        </Box>
        }

          <Typography id="pkTitle" variant="h6" color="Secondary" component="h2" marginBottom="5px">
            Public Key
          </Typography>
          <form onSubmit={handlePkSubmit}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <TextField id="publicKeyInput" label="npub..." variant="outlined" value={localPk} onChange={handlePkChange} fullWidth />
              </Grid>
              {!willUseNostrExtension &&
                <Grid item>
                  <Button variant="contained" color="primary" type="submit" startIcon={<SaveIcon />}>Save</Button>
                </Grid>
              }
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
