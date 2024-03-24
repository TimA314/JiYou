import { Avatar, Box, Chip, Grid, Stack, Tooltip, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { ThemeContext } from '../theme/ThemeContext';
import { getMediaNostrBandImageUrl } from '../utils/eventUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { EventsType, clearCurrentProfileNotes, setRefreshingCurrentProfileNotes } from '../redux/slices/eventsSlice';
import { DiceBears } from '../utils/miscUtils';
import { nip19 } from 'nostr-tools';
import { setProfileToShow } from '../redux/slices/noteSlice';

type Props = {
    followPks: string[];
}

const FollowChip = ({followPks} : Props) => {
    const { themeColors } = useContext(ThemeContext);
    const events: EventsType = useSelector((state: RootState) => state.events);
    const [expand, setExpand] = useState(false);
    const dispatch = useDispatch();
    const dicebear = DiceBears();

    const handleChipClicked = () => {
        setExpand((prev) => !prev);
    }

  return (
    <Box sx={{ 
        color: themeColors.textColor,
        textAlign: 'center',
        marginBottom: "0.5rem",
    }}>

        <Chip 
            label={"Following: " + (followPks.length)}
            onClick={handleChipClicked}
            sx={{ margin: "0.5rem", color: themeColors.textColor, backgroundColor: expand ? themeColors.secondary : themeColors.background}}
        />
            {expand && <Box sx={{
                display: "flex", 
                alignContent: "center", 
                justifyContent: "center", 
                maxHeight: '50rem;',
                overflowY: 'auto',
                }}>
                <Stack spacing={1}>
                    {followPks.map(followPk => {
                        return (
                            <Box 
                                sx={{
                                    borderRadius: "50px;", 
                                    width: "300px", 
                                    height: "50px", 
                                    backgroundColor: themeColors.paper, 
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    dispatch(setProfileToShow(followPk))
                                    dispatch(clearCurrentProfileNotes());
                                    dispatch(setRefreshingCurrentProfileNotes(true));
                                    }}>
                                <Grid container spacing={1} >
                                    <Grid item xs={2} margin="5px">
                                        <Avatar 
                                            aria-label="follow avatar" 
                                            src={getMediaNostrBandImageUrl(followPk, "picture", 64)} 
                                            alt={events.metaData[followPk]?.picture ?? dicebear}
                                            sx={{width: 40, height: 40}}>
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography variant='subtitle1' color={themeColors.textColor}>{events.metaData[followPk]?.name ?? nip19.npubEncode(followPk).slice(0, 8) + "..."}</Typography>
                                        <Tooltip title={events.metaData[followPk]?.nip05 ?? ""}>
                                            <Typography variant='subtitle2' color={themeColors.textColor} >
                                                {
                                                    events.metaData[followPk]?.nip05 ? events.metaData[followPk]?.nip05?.slice(0, 25) + ".." : ""
                                                }
                                            </Typography>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Box>
                            )
                        })}
                </Stack>
            </Box>}
    </Box>
  )
}

export default FollowChip