import React, { useContext, useState } from 'react';
import { Box, FormControlLabel, FormGroup, Switch, TextField, Typography } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { EventTemplate, Kind, SimplePool } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { FullEventData } from '../nostr/Types';
import { extractHashtags } from '../utils/eventUtils';
import { ThemeContext } from '../theme/ThemeContext';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';

interface RelaySwitches {
  [relayUrl: string]: boolean;
}

interface Props {
  pool: SimplePool | null;
  relays: string[];
  pk: string;
  replyEventData: FullEventData | null;
  setPostedNote: () => void;
}


function CreateNote({
  pool, 
  relays, 
  pk, 
  replyEventData, 
  setPostedNote, 
}: Props) {
  const [input, setInput] = useState("");
  const relaylist = relays.reduce((obj, relay) => {
    obj[relay] = true;
    return obj;
  }, {} as RelaySwitches);
  const [relaySwitches, setRelaysSwitches] = useState(relaylist);
  const { themeColors } = useContext(ThemeContext);


  const handleRelaySwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRelaysSwitches(prevState => ({
      ...prevState,
      [event.target.id]: !prevState[event.target.id]
    }));
  };

  const handlePostToRelaysClick = async () => {

    if (!pool) {
      return;
    }
    const tags = [];
    //push reply event id and pk
    if (replyEventData) {
      tags.push(["e", replyEventData.eventId, "", ""]);
      tags.push(["p", pk]);
    }
    
    //push other replies in chain
    const replyEventTags = replyEventData ? replyEventData.tags.filter((t) => t[0] === "e") : [];
    const replyPubKeyTags = replyEventData ? replyEventData.tags.filter((t) => t[0] === "p") : [];

    if (replyEventTags.length > 0) {
      replyEventTags.forEach((tag) => {
        tags.push(tag);
      })
    }

    if (replyPubKeyTags.length > 0) {
      replyPubKeyTags.forEach((tag) => {
        tags.push(tag);
      })
    }
    
    //push hashtags
    const hashTags: string[] = extractHashtags(input);
    if (hashTags.length > 0) {
      hashTags.forEach(tag => {
        tags.push(["t", tag]);
      })
    }

    const relaysToPostTo = relays.filter(relay => relaySwitches[relay]);
    console.log("relays to post: " + relaysToPostTo);

    //cunstruct the event
    const _baseEvent = {
      kind: Kind.Text,
      content: sanitizeString(input),
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
    } as EventTemplate

    //Sign the event with nostr if possible
    if (window.nostr){
      try {
        const signedWithNostr = await signEventWithNostr(pool, relaysToPostTo, _baseEvent);
        if (signedWithNostr) {
          setPostedNote();
          return;
        }
      } catch {}
    }

    //Manually sign the event
    signEventWithStoredSk(pool, relaysToPostTo, _baseEvent)
    setPostedNote();
  }

  return (
  <Box sx={{ marginTop: "20px",height: "auto", width: "auto"}} >
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
          inputProps={{style: {color: themeColors.textColor}}} 
          />
        <Button type="button" 
          variant="contained" 
          color='secondary' 
          onClick={handlePostToRelaysClick}
          >
            Post {replyEventData ? "Reply" : "Note"} To Relays
        </Button>
        <div className='relayListContainer'>
          {relays.map((relay) => (
            <div className='relaySwitch' key={relay}>
              <FormControlLabel 
                control={
                  <Switch 
                    id={relay} 
                    checked={relaySwitches[relay]} 
                    size='small' 
                    onChange={handleRelaySwitchChange}
                  />
                } 
                label={
                  <Typography sx={{ color: themeColors.textColor }}>
                    {relay}
                  </Typography>
                }
              />
            </div>
          ))}
        </div>
      </FormGroup>
    </Box>
  )
}

export default CreateNote