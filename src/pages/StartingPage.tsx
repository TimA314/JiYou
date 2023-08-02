import { Box, Button, Card, InputAdornment, Stack, TextField } from '@mui/material';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext, useState } from 'react';
import { generatePrivateKey, nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useDispatch } from 'react-redux';
import { setKeys } from '../redux/slices/keySlice';
import { generateKeyObject, generatePublicKeyOnlyObject } from '../utils/miscUtils';
import { addMessage } from '../redux/slices/noteSlice';

type Props = {}

export default function StartingPage({}: Props) {
    const dispatch = useDispatch();
    const { themeColors } = useContext(ThemeContext);
    const [skInputEncoded, setSkInputEncoded] = useState<string>("");
    const navigate = useNavigate();



    const handleSignInWithSk = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let decodedSk;

        let isValidInput = skInputEncoded.startsWith("nsec") && skInputEncoded.length > 60;

        if (isValidInput){
            decodedSk = nip19.decode(skInputEncoded.trim());
        }
        
        if (!isValidInput || !decodedSk || decodedSk.type !== "nsec") {
            dispatch(addMessage({message: "Invalid Secret Key", isError: true}));
            return;
        }
        
        const newKeys = generateKeyObject(decodedSk.data.toString());
        
        if (newKeys === null || newKeys?.publicKey.decoded === "") {
            dispatch(addMessage({message: "Invalid Secret Key", isError: true}));
            return;
        }

        localStorage.setItem("sk", newKeys.privateKey.decoded);
        localStorage.setItem("pk", newKeys.publicKey.decoded);
        dispatch(setKeys(newKeys));
        navigate("/");
    };

    const handleCreateNeyKeys = () => {
        const sk = generatePrivateKey();
        const newKeys = generateKeyObject(sk);
        if (newKeys === null) {
            dispatch(addMessage({message: "something went wrong generating new keys", isError: true}))
            return;
        }
        localStorage.setItem("sk", sk);
        localStorage.setItem("pk", newKeys.publicKey.decoded);
        dispatch(setKeys(newKeys))
        navigate("/");
    };

    const handleLogInWithNostrExtension = async () => {
        if (!window.nostr) {
            dispatch(addMessage({message: "Nostr Extension not found", isError: true}))
            return;
        }

        try {
            //Call Nostr Extension for Public Key
            console.log("Calling Nostr Extension for Public Key");
            const publicKey = await window.nostr.getPublicKey();
            console.log(publicKey)
            if (publicKey) {
                const newKeys = generatePublicKeyOnlyObject(publicKey);
                localStorage.setItem("sk", "");
                localStorage.setItem("pk", publicKey);
                dispatch(setKeys(newKeys));
                navigate("/");
                return;
            }
          } catch {
            dispatch(addMessage({message: "Something went wrong with the Nostr Extension", isError: true}))
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
