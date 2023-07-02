import React, { useContext, useState } from 'react';
import { Box, FormControlLabel, FormGroup, Switch, TextField, Typography } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { EventTemplate, Kind, SimplePool } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { FullEventData, RelaySetting } from '../nostr/Types';
import { extractHashtags } from '../utils/eventUtils';
import { ThemeContext } from '../theme/ThemeContext';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';

interface Props {
  pool: SimplePool | null;
  relays: RelaySetting[];
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
  const { themeColors } = useContext(ThemeContext);
  const writableRelayUrls = relays.filter((r) => r.write).map((r) => r.relayUrl);

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
        const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
        if (signedWithNostr) {
          setPostedNote();
          return;
        }
      } catch {}
    }

    //Manually sign the event
    signEventWithStoredSk(pool, writableRelayUrls, _baseEvent)
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
          rows={7}
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
      </FormGroup>
    </Box>
  )
}

export default CreateNote