import { Box, CardMedia } from "@mui/material";
import { Event } from "nostr-tools";
import React, { useContext } from "react";
import { GetImageFromPost, getYoutubeVideoFromPost } from "../../utils/miscUtils";
import { ThemeContext } from '../../theme/ThemeContext';

type NoteMediaProps = {
    setShouldCalculateHeight: React.Dispatch<React.SetStateAction<boolean>>,
    event: Event;
}

const NoteMedia: React.FC<NoteMediaProps> = ({setShouldCalculateHeight, event}) => {
    const { themeColors } = useContext(ThemeContext);
    const images = GetImageFromPost(event.content);
    const youtubeFromPost = getYoutubeVideoFromPost(event.content);
    
    return (
        <Box>
            {
                images.length > 0 && images.map((img) => (
                    <CardMedia
                        component="img"
                        image={img}
                        alt="picture"
                        sizes='medium'
                        key={img + event.sig}
                        onLoad={() => setShouldCalculateHeight(true)}
                        sx={{
                            maxHeight: "600px", 
                            padding: 0, 
                            marginTop: "2px", 
                            width: "100%", 
                            objectFit: "contain", 
                            color: themeColors.textColor,
                        }}
                    />
                ))
            }
          {
            youtubeFromPost && (
                <iframe 
                    src={youtubeFromPost}
                    onLoad={() => setShouldCalculateHeight(true)}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ width: '100%', height: '350px' }}
                />
            )
          }
        </Box>
    )
}

export default React.memo(NoteMedia);