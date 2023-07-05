import { Box, Button, Card, InputAdornment, Stack, TextField } from '@mui/material';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext, useState } from 'react';
import { generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

type Props = {
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setSk_decoded: React.Dispatch<React.SetStateAction<string>>;
    setPk_decoded: React.Dispatch<React.SetStateAction<string>>;
}

export default function StartingPage({setSk_decoded, setPk_decoded, setErrorMessage}: Props) {
    const { themeColors } = useContext(ThemeContext);
    const [skInputEncoded, setSkInputEncoded] = useState<string>("");
    const navigate = useNavigate();



    const handleSignInWithSk = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let decodedSk;

        let isValidInput = skInputEncoded.startsWith("nsec") && skInputEncoded.length > 60;

        try{
            decodedSk = nip19.decode(skInputEncoded);
        }
        catch(e) {
            isValidInput = false;
        }
        
        if (!isValidInput || !decodedSk || !decodedSk.data) {
            setErrorMessage("Invalid Secret Key");
            return;
        }
        const publicKeyDecoded = getPublicKey(decodedSk.data.toString());
        
        if (publicKeyDecoded === "") {
            setErrorMessage("Invalid Secret Key");
            return;
        }

        localStorage.setItem("sk", skInputEncoded);
        localStorage.setItem("pk", nip19.npubEncode(publicKeyDecoded));
        
        setPk_decoded(publicKeyDecoded);
        setSk_decoded(decodedSk.data.toString());
        navigate("/");
    };

    const handleCreateNeyKeys = () => {
        const sk = generatePrivateKey();
        const encodedSk = nip19.nsecEncode(sk);
        localStorage.setItem("sk", encodedSk);
        setSk_decoded(sk);

        const publicKey = getPublicKey(sk);
        const encodedPk = nip19.npubEncode(publicKey);
        localStorage.setItem("pk", encodedPk);
        setPk_decoded(publicKey);
        navigate("/");
    };

    const handleLogInWithNostrExtension = async () => {
        if (!window.nostr) {
            setErrorMessage("Nostr Extension not found");
            return;
        }

        try {
            //Call Nostr Extension for Public Key
            console.log("Calling Nostr Extension for Public Key");
            const publicKey = await window.nostr.getPublicKey();
            console.log(publicKey)
            if (publicKey) {
                const encodedPk = nip19.npubEncode(publicKey);
                if (encodedPk === "") throw new Error();

                localStorage.setItem("sk", "");
                localStorage.setItem("pk", encodedPk);
                setPk_decoded(publicKey);
                console.log("Logged in with Nostr Extension");
                navigate("/");
                return;
            }
          } catch {
            setErrorMessage("Something went wrong with the Nostr Extension");
            return;
          }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkInputEncoded(event.target.value);
    };

    return (
        <Box sx={{
            color: themeColors.textColor, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Box
                sx={{
                    flex: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >

                    <Card sx={{padding: "15px", width: "100%", maxWidth: 700}}>
                        <form onSubmit={handleSignInWithSk} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    InputLabelProps={{sx: {color: themeColors.textColor}}}
                                    label="Secret Key (nsec...)"
                                    name="skInput"
                                    value={skInputEncoded}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        style: { color: themeColors.textColor},
                                        startAdornment: 
                                        <InputAdornment position="start">
                                            <VpnKeyIcon sx={{ color: themeColors.textColor }}/>
                                        </InputAdornment>
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </form>
                    </Card>

            </Box>
            <Box
                sx={{
                    px: 3,
                    mb: '150px',
                    maxWidth: 700,
                    maxHeight:"90%",
                }}
            >
                <form noValidate>
                    <Button
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        type="submit"
                        variant="contained"
                        color="secondary"
                        onClick={handleCreateNeyKeys}
                    >
                        New To Nostr? Create new Keys
                    </Button>
                    <Button
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        variant="contained"
                        onClick={handleLogInWithNostrExtension}
                    >
                        Connect by extension (recommended)
                    </Button>
                </form>
            </Box>
        </Box>
    )
}
