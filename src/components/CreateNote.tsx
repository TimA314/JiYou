import { useContext, useState } from 'react';
import { Box, FormGroup, TextField } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { EventTemplate, Kind } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { extractHashtags } from '../utils/eventUtils';
import { ThemeContext } from '../theme/ThemeContext';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { toggleRefreshUserNotes } from '../redux/slices/eventsSlice';
import { setReplyToNoteEvent } from '../redux/slices/noteSlice';
import { PoolContext } from '../context/PoolContext';

interface Props {}

function CreateNote({}: Props) {
  const pool = useContext(PoolContext);
  const [input, setInput] = useState("");
  const { themeColors } = useContext(ThemeContext);
  const keys = useSelector((state: RootState) => state.keys);
  const note = useSelector((state: RootState) => state.note);
  const nostr = useSelector((state: RootState) => state.nostr);
  const writableRelayUrls = nostr.relays.filter((r) => r.write).map((r) => r.relayUrl);

  const dispatch = useDispatch();


  const handlePostToRelaysClick = async () => {
    if (!pool) {
      return;
    }

    const tags = [];
    //push reply event id and pk
    if (note.replyToNoteEvent) {
      tags.push(["e", note.replyToNoteEvent.id, "", ""]);
      tags.push(["p", keys.publicKey.decoded]);
    }
    
    //push other replies in chain
    const replyEventTags = note.replyToNoteEvent ? note.replyToNoteEvent.tags.filter((t) => t[0] === "e") : [];
    const replyPubKeyTags = note.replyToNoteEvent ? note.replyToNoteEvent.tags.filter((t) => t[0] === "p") : [];

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
    if (window.nostr && keys.privateKey.decoded === ""){
      try {
        const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
        if (signedWithNostr) {
          dispatch(setReplyToNoteEvent(null));
          return;
        }
      } catch {}
    }

    //Manually sign the event
    signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent)
    dispatch(toggleRefreshUserNotes())
    dispatch(setReplyToNoteEvent(null));
  }

  return (
  <Box sx={{ marginTop: "20px"}} >
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
            Post {note.replyToNoteEvent ? "Reply" : "Note"} To Relays
        </Button>
      </FormGroup>
    </Box>
  )
}

export default CreateNote