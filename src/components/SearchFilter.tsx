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
import { addHashTag, addSearchEventId, removeHashTag } from "../redux/slices/noteSlice";
import { toggleRefreshFeedNotes } from "../redux/slices/eventsSlice";

interface Props {}

export default function SearchFilter({}: Props) {
  const note = useSelector((state: RootState) => state.note);
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const { themeColors } = useContext(ThemeContext);


  const searchFromInput = () => {
    const eventIDRegex = /^[0-9a-fA-F]{64}$/; // Regex pattern for event IDs

    if (eventIDRegex.test(input)) {
      dispatch(addSearchEventId(input))
      dispatch(toggleRefreshFeedNotes());
      setInput("");
      return;
    }

    const hashtag = sanitizeString(input).trim();
    if (hashtag === "" || note.hashTags.includes(hashtag)) return;
    setInput("");
    dispatch(addHashTag(hashtag));
    dispatch(toggleRefreshFeedNotes())
  };

  const handleRemoveSearchedEventId = (id: string) => {
    dispatch(addSearchEventId(id));
    dispatch(toggleRefreshFeedNotes())
  }

  const handleRemoveHashtag = (hashtag: string) => {
    dispatch(removeHashTag(hashtag));
    dispatch(toggleRefreshFeedNotes())
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
                onDelete={() => handleRemoveHashtag(tag)} 
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
              onDelete={() => handleRemoveSearchedEventId(id)}
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