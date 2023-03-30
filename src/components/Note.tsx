import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { purple } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment/moment';
import { GetImageFromPost, sanitizeString } from '../util';
import { FullEventData } from '../nostr/Types';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { getPublicKey, SimplePool, Event, EventTemplate, UnsignedEvent, Kind, getEventHash, signEvent, validateEvent, verifySignature, nip19 } from 'nostr-tools';
import { defaultRelays } from '../nostr/Relays';

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

  interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
  }

  interface NoteProps {
    eventData: FullEventData;
}

export default function Note(props: NoteProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState<Boolean>(props.eventData.isFollowing ?? false)
  const imageFromPost = GetImageFromPost(props.eventData.content);
  const localRelays: string | null = localStorage.getItem('relays');
  const relays: string[] = !localRelays || JSON.parse(localRelays)?.length === 0 ? defaultRelays : JSON.parse(localRelays);
  const privateKey = window.localStorage.getItem("localSk");
  const pool = new SimplePool()

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };


  const handleFollowButtonClicked = () => {
    setIsFollowing(!isFollowing);
    updateFollowerEvent();
  }

  const getUserFollowers = async(userFollowerEvent: Event[]) => {
    if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return;

    return userFollowerEvent[0].tags;
  }

  const updateFollowerEvent = async () => {

    let followerEvent = await pool.list(relays, [{kinds: [3], authors: [getPublicKey(privateKey!)], limit: 1 }])

    let prevTags: string[][] = await getUserFollowers(followerEvent) ?? [];
    
    let exists: boolean = prevTags?.find(tag => tag[1] === props.eventData.user.pubKey) !== undefined

    if (exists) return;

    let newTags: string[][] = []

    if (prevTags.length > 0){
      newTags = [...prevTags, ["p", props.eventData.user.pubKey]]
    } else {
      newTags = [["p", props.eventData.user.pubKey]]
    }

    const newFollowerEvent: EventTemplate | UnsignedEvent | Event = {
        kind: Kind.Contacts,
        tags: newTags,
        content: "",
        created_at: Math.floor(Date.now() / 1000),
        pubkey: getPublicKey(privateKey!)
    }

    const signedEvent: Event = {
        ...newFollowerEvent,
        id: getEventHash(newFollowerEvent),
        sig: signEvent(newFollowerEvent, privateKey!),
    };
    
    if(!validateEvent(signedEvent) || !verifySignature(signedEvent)) {
        console.log("Event is Invalid")
        return;
    }

    console.log("Event is valid")

    let pubs = pool.publish(relays, signedEvent);

    pubs.on("ok", () => {
        console.log(`Published Event`);
        return;
    })

    pubs.on("failed", (reason: string) => {
        console.log("failed: " + reason);
        return;
    })
  }
  
  return (
    <Card sx={{ maxWidth: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={props.eventData.user.picture}>
          </Avatar>
        }
        title={props.eventData.user.name}
        subheader={props.eventData.user.nip05}
      />
      {imageFromPost && (
        <CardMedia
          component="img"
          image={imageFromPost}
          alt="picture"
        />)
      }
      <CardContent>
        <Typography variant="body2" color="text.secondary">
        {props.eventData.content}
        </Typography>
      </CardContent>
      <CardContent>
        {props.eventData.hashtags
          .filter((tag) => props.eventData.hashtags.indexOf(tag) === props.eventData.hashtags.lastIndexOf(tag))
          .map((tag) => (
          <Typography variant="caption" color="primary" key={tag}> #{tag}</Typography>
        ))}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <Typography variant="subtitle2">
        {moment.unix(props.eventData.created_at).fromNow()}
        </Typography>

        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box sx={{display: 'flex', alignContent: "flex-end", justifyContent: 'end'}}>
            <Button variant="outlined" color={isFollowing ? "primary" : "success"} onClick={handleFollowButtonClicked}>
              {isFollowing ? "UnFollow" : "Follow"}
            </Button>
          </Box>
          <Typography paragraph display="h6">MetaData:</Typography>
          <Typography variant="caption" display="block">
            Event Id: {props.eventData.eventId}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey: {nip19.npubEncode(props.eventData.user.pubKey)}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey hex: {props.eventData.user.pubKey}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Created: {moment.unix(props.eventData.created_at).format("LLLL")}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            UnixTime: {props.eventData.created_at}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Sig: {props.eventData.sig}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}