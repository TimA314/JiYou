import { Button, Container, Divider, Input, InputAdornment, InputLabel, Stack, styled, Typography } from "@mui/material"
import KeyIcon from '@mui/icons-material/Key';

type Props = {}

const SignIn = (props: Props) => {

  // ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------


  return (
    <StyledRoot>
    <Container maxWidth="sm">
        <StyledContent>
            <Typography variant="h4" gutterBottom>
                Sign In
            </Typography>
            <InputLabel htmlFor="privateKey-input" color='secondary'>
                Private Key
            </InputLabel>
            <Stack direction="row" spacing={2} marginBottom="10px">
                <Input
                    id="privateKey-input"
                    fullWidth
                    size="medium"
                    value={"PkInput"}
                    color="secondary"
                    onChange={(e) => console.log("setPkInput(e.target.value)")}
                    startAdornment={
                        <InputAdornment position="start">
                            <KeyIcon />
                        </InputAdornment>
                    } />
            </Stack>
            <Button fullWidth size="large" color="primary" variant="outlined">
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
        </StyledContent>
    </Container>
</StyledRoot>
  )
}

export default SignIn