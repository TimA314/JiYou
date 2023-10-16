import { Box, Button, Typography } from '@mui/material';
import React from 'react'
import { Event, nip19 } from 'nostr-tools';
import { ThemeContext } from '../../theme/ThemeContext';
import { useContext } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

type NoteDetailsProps = {
    event: Event<number>,
    isFollowing: boolean,
    handleFollowButtonClicked: () => void
}

const NoteDetails: React.FC<NoteDetailsProps> = ({event, isFollowing, handleFollowButtonClicked}) => {
    const { themeColors } = useContext(ThemeContext);
    const events = useSelector((state: RootState) => state.events);

  return (
    <Box>
          <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize ,overflowWrap: 'normal' }}>
          {event.content}
          </Typography>
          <Box sx={{display: 'flex', alignContent: "flex-end", justifyContent: 'end'}}>
            <Button variant="outlined" color={isFollowing ? "primary" : "success"} onClick={handleFollowButtonClicked}>
              {isFollowing ? "UnFollow" : "Follow"}
            </Button>
          </Box>
          <Typography paragraph display="h6" color={themeColors.textColor}>MetaData:</Typography>
          <Typography variant="caption" display="block" color={themeColors.textColor}>
            Event Id: {event.id}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            PubKey: {nip19.npubEncode(event.pubkey) ?? ""}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            PubKey hex: {event.pubkey}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Created: {moment.unix(event.created_at).format("LLLL")}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            UnixTime: {event.created_at}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Sig: {event.sig}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Lud16: {events.metaData[event.pubkey]?.lud16 ?? ""}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Tags: <ul >{[...new Set(event.tags)].map((tag) => <li key={tag[1]}>{tag[0]}: {tag[1]}, {tag[2]}, {tag[3]}</li>)}</ul>
            Tags: <ul >{[...new Set(event.tags)].map((tag) => <li key={tag[1]}>{tag[0]}: {tag[1]}, {tag[2]}, {tag[3]}</li>)}</ul>
          </Typography>
    </Box>
  )
}

export default React.memo(NoteDetails);