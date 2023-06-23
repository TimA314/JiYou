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
import { FullEventData } from '../nostr/Types';
import { Badge, BadgeProps, Box, Button, CircularProgress } from '@mui/material';
import { useContext, useState } from 'react';
import { SimplePool, nip19, EventTemplate } from 'nostr-tools';
import { getYoutubeVideoFromPost } from '../utils/miscUtils';
import { likeEvent } from '../nostr/FeedEvents';
import ForumIcon from '@mui/icons-material/Forum';
import NoteModal from './NoteModal';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplyToNote from './ReplyToNote';
import { ThemeContext } from '../theme/ThemeContext';

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

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
interface NoteProps {
  pk: string;
  eventData: FullEventData;
  pool: SimplePool | null;
  relays: string[];
  following: string[];
  updateFollowing: (pubkey: string) => void;
  setHashtags:  React.Dispatch<React.SetStateAction<string[]>>;
  disableReplyIcon?: boolean;
  gettingThread?: boolean;
  setEventToSign: React.Dispatch<React.SetStateAction<EventTemplate | null>>;
  setSignEventOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hashTags: string[];
  imagesOnlyMode?: boolean;
}

export default function Note({
    pk,
    pool, 
    relays, 
    eventData, 
    following, 
    setHashtags, 
    disableReplyIcon, 
    gettingThread,
    setEventToSign,
    setSignEventOpen,
    hashTags,
    updateFollowing,
  }: NoteProps) {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [noteDetailsOpen, setNoteDetailsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(following.includes(eventData.pubkey));
  const [replyCount, setReplyCount] = useState(0);
  const [replyToNoteOpen, setReplyToNoteOpen] = useState(false);
  const { themeColors } = useContext(ThemeContext);

  const youtubeFromPost = getYoutubeVideoFromPost(eventData.content);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  const handleFollowButtonClicked = () => {
    updateFollowing(eventData.pubkey);
    setIsFollowing(!isFollowing)
  }
  const likeNote = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if(!pool) return;

    setLiked(true);
    const likeCompleted = await likeEvent(pool, relays, eventData, pk, setEventToSign, setSignEventOpen)
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

  const handleReplyToNote = (eventData: FullEventData) => {
    console.log("reply to note", eventData);
    setReplyToNoteOpen(true);
  }

  return (
    <Card sx={{ width: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <NoteModal 
        eventData={eventData}
        setReplyCount={setReplyCount}
        open={noteDetailsOpen}
        setNoteDetailsOpen={setNoteDetailsOpen}
        pool={pool}
        relays={relays}
        following={following}
        updateFollowing={updateFollowing}
        setHashtags={setHashtags}
        pk={pk}
        setSignEventOpen={setSignEventOpen}
        setEventToSign={setEventToSign}
        hashTags={hashTags} />
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={eventData.user.picture}>
          </Avatar>
        }
        title={eventData.user.name}
        subheader={eventData.user.nip05}
        subheaderTypographyProps={{color: themeColors.textColor}}
        style={{color: themeColors.textColor}}
      />
      <ReplyToNote 
        open={replyToNoteOpen} 
        setReplyToNoteOpen={setReplyToNoteOpen} 
        eventData={eventData} 
        pool={pool} 
        relays={relays} 
        pk={pk} 
        following={following} 
        updateFollowing={updateFollowing} 
        setHashtags={setHashtags}
        setSignEventOpen={setSignEventOpen}
        setEventToSign={setEventToSign} 
        hashTags={hashTags}/>
      <CardContent >
        <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize}}>
        {eventData.content}
        </Typography>
        <Box>
          {eventData.images.length > 0 && (
            eventData.images.map((img) => (
            <CardMedia
              component="img"
              image={img}
              alt="picture"
              key={img.length + "image" + Math.random().toString()}
              sx={{maxHeight: "500px", objectFit: "contain", color: themeColors.textColor}}
            />
            ))
          )}
          {youtubeFromPost && (
            <iframe 
            src={youtubeFromPost} 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ width: '100%', height: '315px' }}
          />
          )}
        </Box>
      </CardContent>
      <CardContent>
        {eventData.hashtags
          .filter((tag) => eventData.hashtags.indexOf(tag) === eventData.hashtags.lastIndexOf(tag))
          .map((tag) => (
            <Typography
            variant="caption"
            color="primary"
            key={tag}
            onClick={() => addHashtag(tag)}
            sx={{
              cursor: 'pointer',
              marginRight: '5px',
              textDecoration: 'underline',
              '&:hover': {
                color: 'secondary.main',
              },
            }}
          >
            #{tag}
          </Typography>
        ))}
      </CardContent>
      <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{color: themeColors.textColor}}>
          {moment.unix(eventData.created_at).fromNow()}
        </Typography>
        <Box sx={{display: 'flex', alignContent: "flex-start", justifyContent: 'start'}}>
        <IconButton aria-label="cart" onClick={showReplyThread}>
          <StyledBadge color="secondary">
            {gettingThread ? <CircularProgress /> : <Badge badgeContent={replyCount} color="primary"><ForumIcon color="primary"/></Badge> }
          </StyledBadge>
        </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            onClick={() => disableReplyIcon ? () => {} : handleReplyToNote(eventData)}
            color="secondary"
          >
            <RateReviewIcon />
          </IconButton>
          <FavoriteIconButton 
            aria-label="Upvote note" 
            onClick={likeNote} 
            disabled={liked} 
            sx={{ color: liked ? themeColors.primary : themeColors.textColor }}
            className={liked ? 'animateLike' : ''}
          >
          <Typography variant='caption' sx={{color: themeColors.textColor}}>
            {(eventData.reaction?.upvotes ?? 0) + (liked ? 1 : 0)}
          </Typography>
            <FavoriteIcon id={"favorite-icon-" + eventData.sig} />
          </FavoriteIconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            sx={{color: themeColors.textColor}}
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
          <Typography paragraph display="h6" color={themeColors.textColor}>MetaData:</Typography>
          <Typography variant="caption" display="block" color={themeColors.textColor}>
            Event Id: {eventData.eventId}
          </Typography>
          <Typography variant='caption' display="block" color={themeColors.textColor}>
            Up Votes: {eventData.reaction?.upvotes}
          </Typography>
          <Typography variant='caption' display="block" color={themeColors.textColor}>
            Down Votes: {eventData.reaction?.downvotes}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            PubKey: {nip19.npubEncode(eventData.pubkey)}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            PubKey hex: {eventData.pubkey}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Created: {moment.unix(eventData.created_at).format("LLLL")}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            UnixTime: {eventData.created_at}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Sig: {eventData.sig}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom color={themeColors.textColor}>
            Tags: <ul >{eventData.tags.map((tag) => <li key={tag[1]}>{tag[0]}: {tag[1]}, {tag[2]}, {tag[3]}</li>)}</ul>
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}