import "./Relays.css";
import { useState } from 'react'
import { Button, TextField, Box, Grid, Typography, List, ListItem, ListItemIcon, Paper, FormControl, Switch, FormControlLabel } from '@mui/material';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { SimplePool } from 'nostr-tools';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { RelaySetting } from "../nostr/Types";

interface RelayProps {
    relays: RelaySetting[];
    updateRelays: (relays: RelaySetting[]) => void;
    pool: SimplePool | null;
    pk: string;
}

export default function Relays({relays, updateRelays, pool, pk}: RelayProps) {
    const [relayInput, setRelayInput] = useState("");
    const { themeColors } = useContext(ThemeContext);
    const [relaysAndSetting, setRelaysAndSetting] = useState(relays);
    
    const handleAddRelay = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (relayInput.trim() === "") return;

        try{
            const relayFormatted = relayInput.startsWith("wss://") ? relayInput : "wss://" + relayInput;

            if (relaysAndSetting.find((relayToMatch) => relayToMatch.relayUrl === relayFormatted)){
                setRelayInput("");
                alert("Relay already exists.");
                return;
            }
            
            updateRelays(relaysAndSetting);
            setRelayInput("");

        } catch (error) {
            console.log("Error adding relay" + error);
        }
    }

    const DeleteRelay = async (updatingRelay: RelaySetting) => {
        if (!window.nostr) {
            alert("You need to install a Nostr extension to manage relays")
            return;
        }

        console.log("Deleting Relay: " + updatingRelay.relayUrl);

        try{
            
            const relayTags: string[][] = [];

            relays.forEach((r) => {
                if (relays.find((relayToMatch) => relayToMatch.relayUrl === r.relayUrl)) return;
                const readAndWrite = r.read && r.write ? "" : r.read && !r.write ? "read" : !r.read && r.write ? "write" : "";
                relayTags.push(["r", r.relayUrl, readAndWrite])
            })

            const relaysWithRemovedRelay = relays.filter((r) => r.relayUrl !== updatingRelay.relayUrl);
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
                {relaysAndSetting.map(r => {
                    return (
                        <Paper key={r.relayUrl} className="relayItem">
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
                                            {r.relayUrl}
                                        </Typography>
                                        <FormControl>
                                            <FormControlLabel
                                                value={r.read}
                                                control={<Switch sx={{color: themeColors.primary}} />}
                                                label="Read"
                                                labelPlacement="top"
                                                />
                                        </FormControl>
                                        <FormControl>
                                            <FormControlLabel
                                                value={r.write}
                                                control={<Switch sx={{color: themeColors.primary}} />}
                                                label="Write"
                                                labelPlacement="top"
                                                />
                                        </FormControl>
                                        <FormControl>
                                            <FormControlLabel
                                                value={(r.write && r.read) || (!r.write && !r.read)}
                                                control={<Switch sx={{color: themeColors.primary}} />}
                                                label="Read And Write"
                                                labelPlacement="top"
                                                />
                                        </FormControl>
                                    </Grid>
                                    <Grid item={true} xs={1} >
                                        <Button onClick={() => DeleteRelay(r)}>
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
