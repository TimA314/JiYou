import { Box, Chip, IconButton, InputBase, Paper, Stack} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import "./SearchFilter.css";
import { sanitizeString } from "../utils/sanitizeUtils";
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { Close } from "@mui/icons-material";
import { Filter } from "nostr-tools";


interface Props {
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
  filter: React.MutableRefObject<Filter | null>;
}

export default function SearchFilter({ hashtags, setHashtags, setFetchEvents, filter }: Props) {
  const [input, setInput] = useState("");
  const { themeColors } = useContext(ThemeContext);
  const [ searchedEventIds, setSearchedEventIds ] = useState<string[]>([]);


  const searchFromInput = () => {
    const eventIDRegex = /^[0-9a-fA-F]{64}$/; // Regex pattern for event IDs

    if (eventIDRegex.test(input)) {
      const newEventIds = [...searchedEventIds, input];
      setSearchedEventIds(newEventIds);
      filter.current = {kinds: [1], ids: newEventIds};
      setFetchEvents(true);
      setInput("");
      return;
    }

    const hashtag = sanitizeString(input).trim();
    if (hashtag === "" || hashtags.includes(hashtag)) return;
    setInput("");
    setHashtags([...hashtags, hashtag]);
    setFetchEvents(true);
  };

  const removeSearchedEventId = (id: string) => {
    const newSearchEventIds = searchedEventIds.filter((e) => e !== id);
    setSearchedEventIds(newSearchEventIds);
    if (newSearchEventIds.length === 0) {
      filter.current = null;
      setFetchEvents(true);
      return;
    }
    filter.current = {kinds: [1], ids: searchedEventIds};
    setFetchEvents(true);
  }

  const removeHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter((h) => h !== hashtag));
    setFetchEvents(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchFromInput();
    }
  }

  return (
    <Box sx={{bgcolor: themeColors.paper}} className="hashTagFilterContainer">
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
          {searchedEventIds.map((id) => (
            <Chip
              size="small"
              key={id}
              sx={{ color: themeColors.textColor }}
              deleteIcon={
                <IconButton size="small">
                  <Close sx={{ color: themeColors.textColor }} />
                </IconButton>
              }
              label={id}
              onDelete={() => removeSearchedEventId(id)}
            />
          ))}
        </Stack>
      </Paper>
      <Paper sx={{ p: '2px 4px', display: 'flex', width: "100%" }} >
        <IconButton type="button" sx={{ p: '10px', color: themeColors.textColor }} aria-label="search" onClick={searchFromInput}>
          <SearchIcon />
        </IconButton>
        <InputBase
          size="small"
          placeholder="Search By Topic or Event ID"
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
    </Box>
  );
}