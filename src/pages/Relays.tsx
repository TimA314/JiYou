import "./Relays.css";
import { useState } from 'react'
import { Button, TextField, Box, Grid, Typography, List, ListItem, ListItemIcon, Paper } from '@mui/material';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { SimplePool } from 'nostr-tools';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';

interface RelayProps {
    relays: string[];
    updateRelays: (relays: string[]) => void;
    pool: SimplePool | null;
    pk: string;
}

export default function Relays({relays, updateRelays, pool, pk}: RelayProps) {
    const [relayInput, setRelayInput] = useState("");
    const { themeColors } = useContext(ThemeContext);
    
    const handleAddRelay = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (relayInput.trim() === "") return;

        try{
            const relayFormatted = relayInput.startsWith("wss://") ? relayInput : "wss://" + relayInput;

            if (relays.includes(relayFormatted)){
                setRelayInput("");
                alert("Relay already exists.");
                return;
            }
            
            updateRelays([...relays, relayFormatted]);
            setRelayInput("");

        } catch (error) {
            console.log("Error adding relay" + error);
        }
    }

    const DeleteRelay = async (relay: string) => {
        if (!window.nostr) {
            alert("You need to install a Nostr extension to manage relays")
            return;
        }

        console.log("Deleting Relay: " + relay);

        try{
            
            const relayTags: string[][] = [];

            relays.forEach((r) => {
                if (r === relay) return;
                relayTags.push(["r", r])
            })

            const relaysWithRemovedRelay = relays.filter((r) => r !== relay);
            updateRelays(relaysWithRemovedRelay);
        } catch (error) {
            console.log("Error adding relay" + error);
        }
    }
    

    return (
        <Box id="RelaysBox">
            <Typography sx={{ mt: 4, mb: 2 }} variant="h5" component="div" color={themeColors.textColor}>
                Relays
            </Typography>

            <Box id="relayform">
                <form onSubmit={handleAddRelay}>
                    <TextField
                        id="addRelayInput"
                        label="New Relay"
                        value={relayInput}
                        onChange={(e) => setRelayInput(e.target.value)}
                        helperText="wss://a.relay"
                        FormHelperTextProps={{style: {color: themeColors.textColor}}}
                        inputProps={{style: {color: themeColors.textColor}}}
                        InputLabelProps={{style: {color: themeColors.textColor}}} 
                    />
                    <Button sx={{margin: "10px"}} variant='outlined' color='secondary' type="submit">Add Relay</Button>
                </form>
            </Box>

            <List>
                {relays.map(relay => {
                    return (
                        <Paper key={relay} className="relayItem">
                            <ListItem >
                                <Grid container >
                                    <Grid item={true} xs={1}>
                                            <ListItemIcon >
                                                <SettingsInputAntennaIcon color="success" />
                                            </ListItemIcon>
                                    </Grid>
                                    <Grid item={true} xs={10} >
                                        <Typography 
                                            variant="body1" 
                                            sx={{marginLeft: "7px"}} 
                                            color={themeColors.textColor}>
                                            {relay}
                                        </Typography>
                                    </Grid>
                                    <Grid item={true} xs={1} >
                                        <Button onClick={() => DeleteRelay(relay)}>
                                            <DeleteForeverIcon color="error"/> 
                                        </Button>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        </Paper>
                    )
                })}
            </List>
        </Box>
    )
}
