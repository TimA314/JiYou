import { Chip, IconButton, InputBase, Paper, Stack} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import "./HashtagsFilter.css";
import { sanitizeString } from "../utils/sanitizeUtils";
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { Close } from "@mui/icons-material";


interface Props {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  fetchEvents: boolean;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HashtagsFilter({ hashtags, setHashtags, fetchEvents, setFetchEvents }: Props) {
  const [input, setInput] = useState("");
  const { themeColors } = useContext(ThemeContext);

  const onAddHashTag = () => {
    const hashtag = sanitizeString(input).trim();
    if (hashtag === "" || hashtags.includes(hashtag)) return;
    setInput("");
    setHashtags([...hashtags, hashtag]);
    setFetchEvents(true);
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter((h) => h !== hashtag));
    setFetchEvents(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onAddHashTag();
    }
  }

  return (
    <div className="hashTagFilterContainer">
      <Paper className="hashtagChips">
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {hashtags.filter((value, index, self) => self.indexOf(value) === index).map((tag) => (
              <Chip 
                size="small" 
                key={tag} 
                sx={{color: themeColors.textColor}}
                deleteIcon={
                  <IconButton size="small">
                    <Close sx={{ color: themeColors.textColor }} />
                  </IconButton>
                }
                label={tag}  
                onDelete={() => removeHashtag(tag)} 
                />
          ))}
        </Stack>
      </Paper>
      <Paper sx={{ p: '2px 4px', display: 'flex', width: "100%" }} >
        <IconButton type="button" sx={{ p: '10px', color: themeColors.textColor }} aria-label="search" onClick={onAddHashTag}>
          <SearchIcon />
        </IconButton>
        <InputBase
          size="small"
          placeholder="Search By Topic"
          value={input}
          autoComplete="on"
          autoFocus
          onKeyDown={handleKeyDown}
          inputProps={{ 'aria-label': 'search google maps', color: themeColors.textColor }}
          onChange={(e) => setInput(e.target.value)}
          sx={{ 
            width: "100%",
            marginTop: "10px",
            ml: 1,
            flex: 1,
            color: themeColors.textColor
          }}
          />
      </Paper>
    </div>
  );
}