import { Avatar, Box, Card, CardContent, CardHeader, CardMedia, Grid, Typography } from "@mui/material";
import React, { useContext, useState } from "react";
import { Event } from "nostr-tools";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { ThemeContext } from '../../theme/ThemeContext';
import { setProfileEventToShow } from "../../redux/slices/noteSlice";
import { clearCurrentProfileNotes, setRefreshingCurrentProfileNotes } from "../../redux/slices/eventsSlice";
import { useNavigate } from "react-router-dom";
import { getMediaNostrBandImageUrl } from "../../utils/eventUtils";
import { DiceBears, GetImageFromPost, getYoutubeVideoFromPost } from "../../utils/miscUtils";
import NoteMedia from "./NoteMedia";

type PreviewEventProps = {
    previewEvent: Event<number>,
    setShouldCalculateHeight: React.Dispatch<React.SetStateAction<boolean>>,
    isInModal?: boolean;
}

const previewEvent: React.FC<PreviewEventProps> = ({ previewEvent, setShouldCalculateHeight, isInModal }) => {
    const { themeColors } = useContext(ThemeContext);
    const events = useSelector((state: RootState) => state.events);
    const defaultPreviewEventAvatar = getMediaNostrBandImageUrl(previewEvent.pubkey, "picture", 64);
    const dicebear = DiceBears();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    return (
            <Card 
            elevation={4}
            sx={{ 
              marginBottom: "10px", 
              color: themeColors.textColor, 
              backgroundColor: themeColors.background, 
              fontSize: themeColors.textSize,
              borderRadius: "20px"
              }}>
                <Grid container direction="column" > 

                    <Grid item xs={4}>
                        <CardHeader
                                onClick={() => {
                                    dispatch(setProfileEventToShow(previewEvent))
                                    dispatch(clearCurrentProfileNotes());
                                    dispatch(setRefreshingCurrentProfileNotes(true));
                                    navigate("/profile");
                                }}
                                avatar={
                                  <Avatar 
                                    src={defaultPreviewEventAvatar}  
                                    alt={events.metaData[previewEvent.pubkey]?.picture ?? dicebear}
                                    sx={{width: 24, height: 24}}
                                    />
                                }
                                title={events.metaData[previewEvent.pubkey]?.name ?? ""}
                                subheader={events.metaData[previewEvent.pubkey]?.nip05 ?? ""}
                                subheaderTypographyProps={{color: themeColors.textColor}}
                                style={{color: themeColors.textColor}}>
                        </CardHeader>
                    </Grid>

                    <Grid item xs={8}>
                        <CardContent >
                            <Typography variant="body2">
                                {previewEvent.content}
                            </Typography>
                        </CardContent>
                    </Grid>
                </Grid>

                <NoteMedia 
                    setShouldCalculateHeight={setShouldCalculateHeight}
                    event={previewEvent}
                />
          </Card>
    )
};

export default React.memo(previewEvent);