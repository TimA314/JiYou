import React, { useState } from 'react';
import { FormControlLabel, FormGroup, Switch, TextField } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { defaultRelays } from '../nostr/Relays';
import { Event, EventTemplate, getEventHash, Kind, SimplePool, validateEvent } from 'nostr-tools';
import { sanitizeString } from '../util';

interface Post {
  title: string;
  content: string;
}

interface RelaySwitches {
  [relayUrl: string]: boolean;
}

interface Props {
  pool: SimplePool | null;
}


function CreateNote({pool}: Props) {
  const relaylist = defaultRelays.reduce((obj, relay) => {
    obj[relay] = true;
    return obj;
  }, {} as RelaySwitches);
  const [relays, setRelays] = useState(relaylist);
  const [post, setPost] = useState<Post>({ title: '', content: '' });


  const handleRelaySwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRelays(prevState => ({
      ...prevState,
      [event.target.id]: !prevState[event.target.id]
    }));
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPost({ ...post, title: event.target.value });
  };

  const handlePostToRelaysClick = async () => {
    const noteContent = document.getElementById('noteContent') as HTMLInputElement;
    const relaysToPostTo = Object.keys(relays).filter(relay => relays[relay]);
    console.log(relaysToPostTo);

    //cunstruct the event
    const _baseEvent = {
      kind: Kind.Text,
      content: sanitizeString(noteContent.value),
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    } as EventTemplate

    //check if the user has a nostr extension
    if (!window.nostr) {
      alert("You need to install a Nostr extension to post to the relays")
      console.log("Posted to relays")
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
      const pubs = pool?.publish(relaysToPostTo, newEvent)

      let clearedInput = false;
      pubs?.on("ok", () => {
        alert("Posted to relays")
        console.log("Posted to relays")
        if (clearedInput) return;
        const noteContent = document.getElementById('noteContent') as HTMLInputElement;
        noteContent.value = "";
        clearedInput = true;
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
          focused 
          rows={12}
          margin="normal"
          onChange={handleTitleChange}
        />
        <Button type="button" variant="contained" color='warning' onClick={handlePostToRelaysClick}>Post To Relays</Button>
        <div className='relayListContainer'>
          {defaultRelays.map((relay) => (
            <div className='relaySwitch' key={relay}>
              <FormControlLabel control={<Switch id={relay} checked={relays[relay]} size='small' onChange={handleRelaySwitchChange}/>} label={relay} />
            </div>
          ))}
        </div>
      </FormGroup>
    </div>
  )
}

export default CreateNote