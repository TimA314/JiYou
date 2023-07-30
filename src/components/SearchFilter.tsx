import { Box, Chip, IconButton, InputBase, Paper, Stack} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import "./SearchFilter.css";
import { sanitizeString } from "../utils/sanitizeUtils";
import { ThemeContext } from '../theme/ThemeContext';
import { useContext } from 'react';
import { Close } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setHashTags, setSearchEventIds } from "../redux/slices/noteSlice";
interface Props {
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchFilter({ setFetchEvents }: Props) {
  const note = useSelector((state: RootState) => state.note);
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const { themeColors } = useContext(ThemeContext);


  const searchFromInput = () => {
    const eventIDRegex = /^[0-9a-fA-F]{64}$/; // Regex pattern for event IDs

    if (eventIDRegex.test(input)) {
      const newEventIds = [...note.searchEventIds, input];
      dispatch(setSearchEventIds(newEventIds))
      setFetchEvents(true);
      setInput("");
      return;
    }

  const hashtag = sanitizeString(input).trim();
    if (hashtag === "" || note.hashTags.includes(hashtag)) return;
    setInput("");
    dispatch(setHashTags([...note.hashTags, hashtag]));
    setFetchEvents(true);
  };

  const removeSearchedEventId = (id: string) => {
    const newSearchEventIds = note.searchEventIds.filter((e) => e !== id);
    dispatch(setSearchEventIds(newSearchEventIds));
    setFetchEvents(true);
  }

  const removeHashtag = (hashtag: string) => {
    dispatch(setHashTags(note.hashTags.filter((h) => h !== hashtag)));
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
          {note.hashTags.filter((value, index, self) => self.indexOf(value) === index).map((tag) => (
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
          {note.searchEventIds.map((id) => (
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