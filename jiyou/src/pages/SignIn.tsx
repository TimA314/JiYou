import "./SignIn.css";
import { Alert, Button, Divider, Input, InputAdornment, InputLabel, Typography } from "@mui/material"
import KeyIcon from '@mui/icons-material/Key';
import { generatePrivateKey } from "nostr-tools";
import * as secp from "@noble/secp256k1";
import Snackbar from "@mui/material/Snackbar";
import {useEffect, useState } from 'react';
import { bech32ToHex } from "../util";
import { getPublicKey } from "noble-secp256k1";
import { useNavigate } from "react-router-dom";

type Props = {}

const SignIn = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const privateKey = window.localStorage.getItem("localSk");
  const navigate = useNavigate();

  useEffect(() => {
    if (privateKey && secp.utils.isValidPrivateKey(privateKey)){
        console.log(getPublicKey(privateKey));
        navigate("/profile", {replace: true});
    }
  })

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleNewUserClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const newKey = generatePrivateKey();
    let skInput:HTMLInputElement = document.getElementById("privateKey-input") as HTMLInputElement;
    skInput.value = newKey;
  }

  const handleLogInClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let skInput:HTMLInputElement = document.getElementById("privateKey-input") as HTMLInputElement;
    let sk = skInput.value;

    if (secp.utils.isValidPrivateKey(sk)){
      window.localStorage.setItem("localSk", sk);
      navigate("/profile", {replace: true});
      return;
    }

    const hexKey = bech32ToHex(sk);

    if (secp.utils.isValidPrivateKey(hexKey)) {
      window.localStorage.setItem("localSk", hexKey);

      console.log(getPublicKey(hexKey));
      navigate("/profile", {replace: true});
      return
    }

    setErrorMessage("Invalid Private Key")
    setOpen(true);
  }

  return (

    <div className="signInContainer">
      <Typography variant="h4" gutterBottom>
          Sign In
      </Typography>
      <InputLabel htmlFor="privateKey-input" color='secondary'>
          Private Key
      </InputLabel>
      <Input
          id="privateKey-input"
          fullWidth
          size="medium"
          color="secondary"
          startAdornment={
              <InputAdornment position="start">
                  <KeyIcon />
              </InputAdornment>
          } />
      <Button fullWidth size="large" color="primary" variant="outlined" sx={{marginTop: "10px"}} onClick={handleLogInClicked}>
          Log In
      </Button>
      <Divider sx={{ my: 3 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
      </Typography>
      </Divider>
      <Button fullWidth size="large" color="warning" variant="outlined" onClick={handleNewUserClicked}>
          New User? Generate Private Key
      </Button>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
      </Snackbar>
    </div>
  )
}

export default SignIn