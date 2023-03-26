import "./Relays.css";
import { useEffect, useState } from 'react'
import { Button, TextField, Box, Grid, Typography, List, ListItem, ListItemIcon, Paper, Snackbar, Alert } from '@mui/material';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { EventTemplate, getEventHash, getPublicKey, Kind, signEvent, SimplePool, UnsignedEvent, validateEvent, verifySignature, Event } from 'nostr-tools';
import { useNavigate } from 'react-router';
import { defaultRelays } from "../nostr/Relays";
import * as secp from "@noble/secp256k1";
import { sanitizeString } from "../util";

export default function Relays() {
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [relayList, setRelayList] = useState<string[]>([]);
    const privateKey = window.localStorage.getItem("localSk");
    let localRelays: string | null = localStorage.getItem('relays');
    const relays: string[] = !localRelays || JSON.parse(localRelays)?.length === 0 ? defaultRelays : JSON.parse(localRelays);
    const navigate = useNavigate();
    const pool = new SimplePool();
    
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
      };

    useEffect(() => {
        if (!secp.utils.isValidPrivateKey(privateKey ?? "")) navigate("/", {replace: true});

        const getEvents = async () => {
            let currentRelaysEvent = await pool.list(relays, [{kinds: [10002], authors: [getPublicKey(privateKey!)], limit: 1 }])

            if (currentRelaysEvent[0] && currentRelaysEvent[0].tags.length > 0){
                let relayStrings: string[] = [];
                currentRelaysEvent[0].tags.forEach((tag) => {
                    if(tag[0] === "r") {
                        relayStrings.push(tag[1]);
                    }
                })
                window.localStorage.setItem("relays", JSON.stringify(relayStrings))
                setRelayList(relayStrings)
            }
        }
        getEvents();
    })
    
    
    const handleAddRelay = () => {
        let relayInput: HTMLInputElement = document.getElementById("addRelayInput") as HTMLInputElement;
        const sanitizedRelayInput = sanitizeString(relayInput.value);

        if (sanitizedRelayInput === "" || !sanitizedRelayInput.includes("wss")){
            console.log("Please enter a relay url.")
            return;
        }

        if (relays.includes(sanitizedRelayInput)){
            console.log("Relay already exists.");
            return;
        }
        window.localStorage.setItem("relays", JSON.stringify([...relayList, sanitizedRelayInput]));
        setRelayList((prev) => [...prev, sanitizedRelayInput]);
        console.log("relay added")
    }

    const DeleteRelay = (relay: string) => {
        console.log("Deleting Relay: " + relay);
        if (relayList.length === 1){
            console.log("Keep at least one relay");
            return;
        }
        const deletedRelayList = relayList.filter((r) => r !== relay);
        setRelayList(deletedRelayList);
        console.log("Relay Removed.")
    }

    const handleSaveRelays = async () => {
        let saveRelayPool = new SimplePool();
        let prevRelays = await saveRelayPool.list(relayList, [{kinds: [10002], authors: [getPublicKey(privateKey!)], limit: 1 }])
        console.log("PrevRelays" + prevRelays)

        let relayTags: string[][] = [];

        relayList.forEach(relay => {
            relayTags.push(["r", relay])
        });

        const newRelaysEvent: EventTemplate | UnsignedEvent | Event = {
            kind: Kind.RelayList,
            tags: relayTags,
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            pubkey: getPublicKey(privateKey!)
        }

        const signedEvent: Event = {
            ...newRelaysEvent,
            id: getEventHash(newRelaysEvent),
            sig: signEvent(newRelaysEvent, privateKey!),
        };
        
        if(!validateEvent(signedEvent) || !verifySignature(signedEvent)) {
            console.log("Event is Invalid")
            return;
        }

        console.log("Event is valid")
      
        let pubs = saveRelayPool.publish(relayList, signedEvent);
        console.log("pubs: " + JSON.stringify(pubs));
        
        pubs.on("ok", () => {
          console.log(`Published Event`);
          return "ok";
        })
      
        pubs.on("failed", (reason: string) => {
            console.log("failed: " + reason);
            return "failed";
        })
    }


    return (
        <Box id="RelaysBox">
            <Typography sx={{ mt: 4, mb: 2 }} variant="h5" component="div">
                Relays
            </Typography>

            <List>
                {relayList.map(relay => {
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
                                        <Typography variant="body2" sx={{marginLeft: "7px"}}>
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

            <Box id="relayform">
                <TextField
                id="addRelayInput"
                label="New Relay"
                defaultValue=""
                helperText="wss://example.com"
                />
                <Button sx={{margin: "5px"}} variant='outlined' color='secondary' onClick={handleAddRelay}>Add Relay</Button>
                <Button sx={{margin: "5px"}} variant='outlined' color='warning' onClick={handleSaveRelays}>Save Relays Publicly</Button>
            </Box>
            <Snackbar open={open} autoHideDuration={6000}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
            </Snackbar>
            </Box>
    )
}
