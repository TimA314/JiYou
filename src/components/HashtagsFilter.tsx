import { Chip, IconButton, InputBase, Paper, Stack} from "@mui/material";
import { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import "./HashtagsFilter.css";
import { sanitizeString } from "../util";

interface Props {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
}

export default function HashtagsFilter({ hashtags, onChange }: Props) {
  const [input, setInput] = useState("");

  const onAddHashTag = () => {
    const hashtag = sanitizeString(input).toLowerCase();
    if (hashtag === "" || hashtags.includes(hashtag)) return;
    setInput("");
    onChange([...hashtags, hashtag]);
  };

  const removeHashtag = (hashtag: string) => {
    onChange(hashtags.filter((h) => h !== hashtag));
  };

  return (
    <div className="hashTagFilterContainer">
      <Paper className="hashtagChips">
        <Stack direction="row" spacing={1}>
          {hashtags.filter((value, index, self) => self.indexOf(value) === index).map((tag) => (
              <Chip size="small" key={tag} label={tag} onDelete={() => removeHashtag(tag)} />
          ))}
        </Stack>
      </Paper>
      <Paper sx={{ p: '2px 4px', display: 'flex', width: "100%" }} >
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={onAddHashTag}>
          <SearchIcon />
        </IconButton>
        <InputBase
          size="small"
          placeholder="Search By Topic"
          value={input}
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(e) => setInput(e.target.value)}
          sx={{ 
            width: "100%",
            marginTop: "10px",
            ml: 1,
            flex: 1
          }}
          />
      </Paper>
    </div>
  );
}