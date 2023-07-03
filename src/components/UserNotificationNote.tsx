import { Avatar, Box, Card, CardActions, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, Stack, Typography, styled } from "@mui/material";
import { Event, nip19 } from "nostr-tools";
import { ThemeContext } from '../theme/ThemeContext';
import { useCallback, useContext, useState } from "react";
import { MetaData } from "../nostr/Types";
import { DiceBears } from "../utils/miscUtils";
import moment from "moment";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
  }
  
const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
    })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

type Props = {
    event: Event;
    metaData: MetaData;
}

export default function UserNotificationNote({event, metaData}: Props) {
    const { themeColors } = useContext(ThemeContext);
    const [expanded, setExpanded] = useState(false);
    const defaultAvatar = DiceBears();

    const handleExpandClick = useCallback(() => {
        setExpanded((expanded: boolean) => !expanded);
      }, []);
    
  return (
    <Card sx={{ color: themeColors.textColor, fontSize: themeColors.textSize}}>
        <Stack direction="row" spacing={2}>
        <CardHeader
            avatar={
            <Avatar aria-label="profile picture" src={metaData?.picture ?? defaultAvatar}>
            </Avatar>
            }
            title={metaData?.name ?? event.pubkey.substring(0, 6) + "..."}
            subheader={metaData?.nip05 ?? ""}
            subheaderTypographyProps={{color: themeColors.textColor}}
            style={{color: themeColors.textColor}}
        />
            <CardContent >
                    {event.content}
                    {event.tags.map((tag) => {
                        return (
                            <Typography variant="body2">
                                {tag[0] + ": " + tag[1]}
                            </Typography>
                        )
                    })}
            </CardContent>
            <CardActions>
                <Box>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        sx={{color: themeColors.textColor}}
                        aria-label="show more"
                        >
                        <ExpandMoreIcon />
                    </ExpandMore>

                </Box>
            </CardActions>
        </Stack>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
            <Typography paragraph display="h6" color={themeColors.textColor}>MetaData:</Typography>
            <Typography variant="caption" display="block" color={themeColors.textColor}>
                Event Id: {event.id}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
                PubKey: {nip19.npubEncode(event.pubkey)}
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
                Tags: <ul >{event.tags.map((tag) => <li key={tag[1]}>{tag[0]}: {tag[1]}, {tag[2]}, {tag[3]}</li>)}</ul>
            </Typography>
            </CardContent>
        </Collapse>
    </Card>
  )
}