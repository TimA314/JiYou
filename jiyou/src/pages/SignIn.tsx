import "./SignIn.css";
import { Button, Container, Divider, Input, InputAdornment, InputLabel, Stack, styled, Typography } from "@mui/material"
import KeyIcon from '@mui/icons-material/Key';

type Props = {}

const SignIn = (props: Props) => {


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
      <Button fullWidth size="large" color="primary" variant="outlined" sx={{marginTop: "10px"}}>
          Log In
      </Button>
      <Divider sx={{ my: 3 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
      </Typography>
      </Divider>
      <Button fullWidth size="large" color="warning" variant="outlined" >
          New User? Generate Private Key
      </Button>
    </div>
  )
}

export default SignIn