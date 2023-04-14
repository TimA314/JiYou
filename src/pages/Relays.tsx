import "./Relays.css";
import { useEffect } from 'react'
import { Button, TextField, Box, Grid, Typography, List, ListItem, ListItemIcon, Paper } from '@mui/material';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { EventTemplate, getEventHash, Kind, SimplePool, validateEvent, verifySignature, Event } from 'nostr-tools';
import { sanitizeString } from "../utils/sanitizeUtils";
import { defaultRelays } from "../nostr/Relays";

interface RelayProps {
    relays: string[];
    setRelayArray: (relays: string[]) => void;
    pool: SimplePool | null;
}

export default function Relays({relays, setRelayArray, pool}: RelayProps) {

    useEffect(() => {
        if (!pool) return;

        const getEvents = async () => {
            try {
                const pk = await window.nostr.getPublicKey();
                let currentRelaysEvent = await pool.list(relays, [{kinds: [10002], authors: [pk], limit: 1 }])
                
                if (currentRelaysEvent[0] && currentRelaysEvent[0].tags.length > 0){
                    let relayStrings: string[] = [];
                    currentRelaysEvent[0].tags.forEach((tag) => {
                        if(tag[0] === "r") {
                            const sanitizedRelay = sanitizeString(tag[1]);
                            if (sanitizedRelay.startsWith("wss://")){
                                relayStrings.push(sanitizedRelay);
                            }
                        }
                    })
                    console.log(relayStrings)
                    setRelayArray(relayStrings);
                }
                
            } catch (error) {
              alert(error)
              console.log(error);
            }
          }
        
        if (window.nostr){
            getEvents();
        }
    }, [pool])
    
    
    const handleAddRelay = async () => {
        if (!window.nostr) {
            alert("You need to install a Nostr extension to post to the relays")
            return;
        }

        try{
            const pk = await window.nostr.getPublicKey();
            const relayInput: HTMLInputElement = document.getElementById("addRelayInput") as HTMLInputElement;

            const relayFormatted = relayInput.value.startsWith("wss://") ? relayInput.value : "wss://" + relayInput.value;

            if (relays.includes(relayFormatted)){
                relayInput.value = "";
                alert("Relay already exists.");
                return;
            }
            
            const relayTags: string[][] = [];
            //construct the tags
            relays.forEach((r) => {
                relayTags.push(["r", r])
            })

            relayTags.push(["r", relayFormatted]);
            
            //cunstruct the event
            const _baseEvent = {
                kind: Kind.RelayList,
                content: "",
                created_at: Math.floor(Date.now() / 1000),
                tags: relayTags,
            } as EventTemplate

            const sig = (await window.nostr.signEvent(_baseEvent)).sig;

            const newEvent: Event = {
                ..._baseEvent,
                id: getEventHash({
                    ..._baseEvent,
                    pubkey: pk
                }),
                sig: sig,
                pubkey: pk,
            }

            if(!validateEvent(newEvent) || !verifySignature(newEvent)) {
                console.log("Event is Invalid")
                return;
            }

            const pubs = pool?.publish(defaultRelays, newEvent)
            pubs?.on("ok", () => {
                alert("Posted to relays")
                console.log("Posted to relays")
            })

            relayInput.value = "";
            setRelayArray([...relays, relayFormatted]);
            
        } catch (error) {
            alert("Canceled")
            console.log("Error adding relay" + error);
        }
    }

    const DeleteRelay = async (relay: string) => {
        if (!window.nostr) {
            alert("You need to install a Nostr extension to post to the relays")
            return;
        }

        console.log("Deleting Relay: " + relay);

        try{
            const pk = await window.nostr.getPublicKey();
            
            const relayTags: string[][] = [];

            relays.forEach((r) => {
                if (r === relay) return;
                relayTags.push(["r", r])
            })
            
            console.log("deleted relaylist: " + relayTags);

            const _baseEvent = {
                kind: Kind.RelayList,
                content: "",
                created_at: Math.floor(Date.now() / 1000),
                tags: relayTags,
            } as EventTemplate

            const sig = (await window.nostr.signEvent(_baseEvent)).sig;

            const newEvent: Event = {
                ..._baseEvent,
                id: getEventHash({
                    ..._baseEvent,
                    pubkey: pk
                }),
                sig: sig,
                pubkey: pk,
            }

            if(!validateEvent(newEvent) || !verifySignature(newEvent)) {
                console.log("Event is Invalid")
                return;
            }

            const relaysWithRemovedRelay = relays.filter((r) => r !== relay);
            setRelayArray(relaysWithRemovedRelay);

            const pubs = pool?.publish(relays, newEvent)
            pubs?.on("ok", () => {
                alert("Posted to relays")
                console.log("Posted to relays")
              })
              
        } catch (error) {
            alert("Canceled")
            console.log("Error adding relay" + error);
        }
    }

    

    return (
        <Box id="RelaysBox">
            <Typography sx={{ mt: 4, mb: 2 }} variant="h5" component="div">
                Relays
            </Typography>

            <Box id="relayform">
                <Button sx={{marginBottom: "10px"}} variant='outlined' color='secondary' onClick={handleAddRelay}>Add Relay</Button>
                <TextField
                id="addRelayInput"
                label="New Relay"
                defaultValue=""
                helperText="wss://example.com"
                />
            </Box>

            <List>
                {relays.map(relay => {
                    return (
                        <Paper key={relay} className="relayItem">
                            <ListItem >
                                <Grid container >
                                    <Grid item={true} xs={1}>
                                            <ListItemIcon>
                                                <SettingsInputAntennaIcon />
                                            </ListItemIcon>
                                    </Grid>
                                    <Grid item={true} xs={10} >
                                        <Typography variant="body1" sx={{marginLeft: "7px"}}>
                                            {relay}
                                        </Typography>
                                    </Grid>
                                    <Grid item={true} xs={1} >
                                        <Button onClick={() => DeleteRelay(relay)}>
                                            <DeleteForeverIcon /> 
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
