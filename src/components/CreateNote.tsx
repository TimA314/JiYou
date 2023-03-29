import React, { useState } from 'react';
import { TextField } from '@mui/material';

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
    <form onSubmit={handleSubmit}>
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={post.title}
        onChange={handleTitleChange}
      />
      </form>
  )
}

export default CreateNote