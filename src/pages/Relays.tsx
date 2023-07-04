import "./Relays.css";
import { useEffect, useState } from 'react'
import { Button, TextField, Box, Grid, Typography, List, ListItem, ListItemIcon, Paper, FormControl, Switch, FormControlLabel } from '@mui/material';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { RelaySetting } from "../nostr/Types";

interface RelayProps {
    relays: RelaySetting[];
    updateRelays: (relays: RelaySetting[]) => void;
    relaysAndSetting: RelaySetting[];
    setRelaysAndSetting: React.Dispatch<React.SetStateAction<RelaySetting[]>>;
}

export default function Relays({relays, updateRelays, relaysAndSetting, setRelaysAndSetting}: RelayProps) {
    const [relayInput, setRelayInput] = useState("");
    const { themeColors } = useContext(ThemeContext);
    
    useEffect(() => {
        setRelaysAndSetting(relays);
    }, [relays])

    const handleToggleRead = (toggledRelay: RelaySetting) => {
        const readValue = toggledRelay.read === true && toggledRelay.write === false ? true : !toggledRelay.read;
        const writeValue = readValue === false && toggledRelay.write === false ? true : toggledRelay.write;
  

        const updatedRelays = relaysAndSetting.map(r =>
            r.relayUrl === toggledRelay.relayUrl ? { ...r, read: readValue, write: writeValue } : r
        );
        setRelaysAndSetting(updatedRelays);
    };
    
    const handleToggleWrite = (toggledRelay: RelaySetting) => {
        const writeValue = toggledRelay.write === true  && toggledRelay.read === false ? true : !toggledRelay.write;
        const readValue = writeValue === false && toggledRelay.read === false ? true : toggledRelay.read;

        const updatedRelays = relaysAndSetting.map(r =>
            r.relayUrl === toggledRelay.relayUrl ? { ...r, read: readValue, write: writeValue } : r
        );
        setRelaysAndSetting(updatedRelays);
    };

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
            const newRelaysToUpdate = [...relaysAndSetting, {relayUrl: relayFormatted, read: true, write: true}];
            setRelaysAndSetting(newRelaysToUpdate);
            updateRelays(newRelaysToUpdate);
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
            setRelaysAndSetting(relaysWithRemovedRelay);
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
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                <Button 
                    variant='outlined' 
                    color='primary'
                    sx={{float: "right", margin: "10px"}}
                    onClick={() => updateRelays(relaysAndSetting)}
                    >
                    Save Settings
                </Button>
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
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'row'}}>
                                            <FormControl>
                                                <FormControlLabel
                                                    value={r.read}
                                                    control={<Switch size="small" checked={r.read} onChange={() => handleToggleRead(r)} sx={{color: themeColors.primary}} />}
                                                    label={<Typography color={themeColors.textColor} variant="caption">Read</Typography>}
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormControlLabel
                                                    value={r.write}
                                                    control={<Switch size="small" checked={r.write} onChange={() => handleToggleWrite(r)} sx={{color: themeColors.primary}} />}
                                                    label={<Typography color={themeColors.textColor} variant="caption">Write</Typography>}
                                                />
                                            </FormControl>
                                        </Box>
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
