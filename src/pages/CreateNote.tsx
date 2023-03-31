import React, { useState } from 'react';
import { FormControlLabel, FormGroup, Switch, TextField } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { Event, EventTemplate, getEventHash, Kind, SimplePool, validateEvent } from 'nostr-tools';
import { sanitizeString } from '../util';

interface RelaySwitches {
  [relayUrl: string]: boolean;
}

interface Props {
  pool: SimplePool | null;
  relays: string[];
}


function CreateNote({pool, relays}: Props) {
  const [input, setInput] = useState("");
  const relaylist = relays.reduce((obj, relay) => {
    obj[relay] = true;
    return obj;
  }, {} as RelaySwitches);
  const [relaySwitches, setRelaysSwitches] = useState(relaylist);

  const handleRelaySwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRelaysSwitches(prevState => ({
      ...prevState,
      [event.target.id]: !prevState[event.target.id]
    }));
  };

  const handlePostToRelaysClick = async () => {
    if (!pool) {
      alert("pool is null")
      return;
    }
    
    const relaysToPostTo = relays.filter(relay => relaySwitches[relay]);
    console.log("relays to post: " + relaysToPostTo);

    //cunstruct the event
    const _baseEvent = {
      kind: Kind.Text,
      content: sanitizeString(input),
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    } as EventTemplate

    //check if the user has a nostr extension
    if (!window.nostr) {
      alert("You need to install a Nostr extension to post to the relays")
      return;
    }

    try {
      const pubkey = await window.nostr.getPublicKey();
      //prompt the user to sign the event
      const sig = (await window.nostr.signEvent(_baseEvent)).sig;
      
      const newEvent: Event = {
        ..._baseEvent,
        id: getEventHash({..._baseEvent, pubkey}),
        sig,
        pubkey,
      }
      
      console.log(validateEvent(newEvent))

      //post the event to the relays
      const pubs = pool.publish(relaysToPostTo, newEvent)

      let clearedInput = false;
      
      pubs.on("ok", () => {
        alert("Posted to relays")
        console.log("Posted to relays")
        if (clearedInput) return;
        clearedInput = true;
        setInput("");
      })

      pubs.on("failed", (error: string) => {
        alert("Failed to post to relays" + error)
      })

    } catch (error) {
      alert("Canceled")
      console.log(error);
    }
  };
  return (
    <div className="newNoteContainer">
      <FormGroup>
        <TextField
          id="noteContent"
          label="What's on your mind?"
          variant="outlined"
          fullWidth
          multiline
          value={input}
          onChange={(e) => setInput(e.target.value)}
          focused 
          rows={12}
          margin="normal"
        />
        <Button type="button" variant="contained" color='warning' onClick={handlePostToRelaysClick}>Post To Relays</Button>
        <div className='relayListContainer'>
          {relays.map((relay) => (
            <div className='relaySwitch' key={relay}>
              <FormControlLabel control={<Switch id={relay} checked={relaySwitches[relay]} size='small' onChange={handleRelaySwitchChange}/>} label={relay} />
            </div>
          ))}
        </div>
      </FormGroup>
    </div>
  )
}

export default CreateNote