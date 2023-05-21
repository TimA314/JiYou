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
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment/moment';
import { FullEventData, GettingReplies } from '../nostr/Types';
import { Box, Button, Chip } from '@mui/material';
import { useState } from 'react';
import { SimplePool, nip19, Event } from 'nostr-tools';
import { GetImageFromPost, getYoutubeVideoFromPost } from '../utils/miscUtils';
import { likeEvent } from '../nostr/FeedEvents';
import ForumIcon from '@mui/icons-material/Forum';
import NoteModal from './NoteModal';


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

const FavoriteIconButton = styled(IconButton)(({ theme }) => ({
  '&.animateLike': {
    animation: '$scaleAnimation 0.3s ease-in-out',
    color: 'purple',
  },
  '@keyframes scaleAnimation': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.3)' },
    '100%': { transform: 'scale(1)' },
  },
}));

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
interface NoteProps {
  eventData: FullEventData;
  pool: SimplePool | null;
  relays: string[];
  followers: string[];
  setFollowing: (pubkey: string) => void;
  setHashtags:  React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Note({pool, relays, eventData, followers, setFollowing, setHashtags}: NoteProps) {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [noteDetailsOpen, setNoteDetailsOpen] = useState(false);
  const imageFromPost = GetImageFromPost(eventData.content);
  const youtubeFromPost = getYoutubeVideoFromPost(eventData.content);
  const [isFollowing, setIsFollowing] = useState(followers.includes(eventData.pubkey));
  const [gettingReplies, setGettingReplies] = useState(GettingReplies.notRequested);
  const [replies, setReplies] = useState<Event[]>([]);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  const handleFollowButtonClicked = () => {
    if(!window.nostr) {
      alert("You need to install a Nostr extension to follow this user");
      return;
    }
    
    setIsFollowing(!isFollowing)
    setFollowing(eventData.pubkey)
  }
  const likeNote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if(!pool) return;

    setLiked(true);
    const likeCompleted = await likeEvent(pool, relays, eventData)
    if(likeCompleted === false) {
      setLiked(false);
    }
  }

  const showReplyThread = () => {
    console.log("show reply thread")
    setNoteDetailsOpen(NoteDetailsOpen => !NoteDetailsOpen);
  }

  const addHashtag = (tag: string) => {
    console.log("add hashtag", tag)
    setHashtags(hashtags => [...hashtags, tag]);
  }

  return (
    <Card sx={{ width: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={eventData.user.picture}>
          </Avatar>
        }
        title={eventData.user.name}
        subheader={eventData.user.nip05}
      />
      <NoteModal 
        eventData={eventData}
        replies={replies}
        setReplies={setReplies}
        gettingReplies={gettingReplies}
        setGettingReplies={setGettingReplies}
        open={noteDetailsOpen}
        setNoteDetailsOpen={setNoteDetailsOpen}
        pool={pool}
        relays={relays}
        followers={followers}
        setFollowing={setFollowing}
        setHashtags={setHashtags}/>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
        {imageFromPost ? eventData.content.replace(imageFromPost, "") : eventData.content}
        {imageFromPost && (
        <CardMedia
          component="img"
          image={imageFromPost}
          alt="picture"
          sx={{maxHeight: "500px", objectFit: "contain"}}
        />)
      }
      {youtubeFromPost && (
        <iframe 
        src={youtubeFromPost} 
        title="YouTube video player" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ width: '100%', height: '315px' }}
      />
      )}
        </Typography>
      </CardContent>
      <CardContent>
        {eventData.hashtags
          .filter((tag) => eventData.hashtags.indexOf(tag) === eventData.hashtags.lastIndexOf(tag))
          .map((tag) => (
          <Typography variant="caption" color="primary" key={tag} onClick={() => addHashtag(tag)}> #{tag}</Typography>
        ))}
      </CardContent>
      <CardContent sx={{ alignContent: "flex-end", alignItems: "flex-end", flexDirection: "row", alignSelf: "flex-end"}}>
      </CardContent>
      <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">
          {moment.unix(eventData.created_at).fromNow()}
        </Typography>
        <Box sx={{display: 'flex', alignContent: "flex-start", justifyContent: 'start'}}>
             <Chip size="small" label={gettingReplies === GettingReplies.notRequested ? "View" 
              : gettingReplies === GettingReplies.requestingReplies ? "Loading Replies..." : replies.length} variant="outlined" color="primary" icon={<ForumIcon />} onClick={showReplyThread}/>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FavoriteIconButton 
            aria-label="Upvote note" 
            onClick={likeNote} 
            disabled={liked} 
            color={liked ? "primary" : "default"} 
            className={liked ? 'animateLike' : ''}
          >
          <Typography variant='caption'>
            {(eventData.reaction?.upvotes ?? 0) + (liked ? 1 : 0)}
          </Typography>
            <FavoriteIcon id={"favorite-icon-" + eventData.sig} />
          </FavoriteIconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
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
            Event Id: {eventData.eventId}
          </Typography>
          <Typography variant='caption' display="block">
            Up Votes: {eventData.reaction?.upvotes}
          </Typography>
          <Typography variant='caption' display="block">
            Down Votes: {eventData.reaction?.downvotes}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey: {nip19.npubEncode(eventData.pubkey)}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey hex: {eventData.pubkey}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Created: {moment.unix(eventData.created_at).format("LLLL")}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            UnixTime: {eventData.created_at}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Sig: {eventData.sig}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Tags: <ul >{eventData.tags.map((tag) => <li key={tag[1]}>{tag[0]}: {tag[1]}, {tag[2]}, {tag[3]}</li>)}</ul>
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}