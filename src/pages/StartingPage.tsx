import { Box, Button, Card, Stack, TextField } from '@mui/material';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext, useState } from 'react';

type Props = {
    setSk_decoded: React.Dispatch<React.SetStateAction<string>>;
    setPk_decoded: React.Dispatch<React.SetStateAction<string>>;
}

export default function StartingPage({setSk_decoded, setPk_decoded}: Props) {
    const { themeColors } = useContext(ThemeContext);
    const [skInput, setSkInput] = useState<string>("");

    const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSkInput(event.target.value);
    };

    return (
        <Box sx={{color: themeColors.textColor, display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
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
                        <form onSubmit={handleSignIn} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    InputLabelProps={{sx: {color: themeColors.textColor}}}
                                    label="Secret Key (nsec...)"
                                    name="skInput"
                                    value={skInput}
                                    onChange={handleInputChange}
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
                    maxHeight:"90%"
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
                    >
                        New To Nostr? Create new Keys
                    </Button>
                    <Button
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        type="submit"
                        variant="contained"
                    >
                        Connect by extension (recommended)
                    </Button>
                </form>
            </Box>
        </Box>
    )
}
