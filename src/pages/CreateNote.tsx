import React, { useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup, Switch, TextField } from '@mui/material';
import './CreateNote.css';
import Button from '@mui/material/Button';
import { defaultRelays } from '../nostr/Relays';

interface Post {
  title: string;
  content: string;
}

function CreateNote() {
    const [post, setPost] = useState<Post>({ title: '', content: '' });

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPost({ ...post, title: event.target.value });
    };
  
    const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPost({ ...post, content: event.target.value });
    };
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log(post);
      // Send post to API or save to database
    };
  return (
    <div className="newNoteContainer">
      <FormGroup>
        <TextField
          label="What's on your mind?"
          variant="outlined"
          fullWidth
          multiline
          rows={12}
          margin="normal"
          value={post.title}
          onChange={handleTitleChange}
        />
        <Button type="submit" variant="contained" color='warning'>Post To Relays</Button>
        <div className='relayListContainer'>
          {defaultRelays.map((relay) => (
            <div className='relaySwitch' key={relay}>
              <FormControlLabel control={<Switch defaultChecked size='small'/>} label={relay} />
            </div>
          ))}
        </div>
      </FormGroup>
    </div>
  )
}

export default CreateNote