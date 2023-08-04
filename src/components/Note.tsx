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
import { Badge, BadgeProps, Box, Button, CircularProgress, Grid, Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { nip19, EventTemplate, Kind, Event } from 'nostr-tools';
import { DiceBears, GetImageFromPost, getYoutubeVideoFromPost } from '../utils/miscUtils';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import ForumIcon from '@mui/icons-material/Forum';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ThemeContext } from '../theme/ThemeContext';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addHashTag, setNoteModalEvent, setReplyToNoteEvent, addSearchEventId } from '../redux/slices/noteSlice';
import { PoolContext } from '../context/PoolContext';


//Expand Note
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

//Styles
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


interface NoteProps {
  event: Event;
  updateFollowing: (pubkey: string) => void;
  disableReplyIcon?: boolean;
  gettingThread?: boolean;
  isInModal?: boolean;
}

const Note: React.FC<NoteProps> = ({
    event,
    disableReplyIcon, 
    gettingThread,
    updateFollowing,
    isInModal = false,
  }: NoteProps) => {
  const { themeColors } = useContext(ThemeContext);
  const pool = useContext(PoolContext);
  const keys = useSelector((state: RootState) => state.keys);
  const events = useSelector((state: RootState) => state.events);
  const note = useSelector((state: RootState) => state.note);
  const nostr = useSelector((state: RootState) => state.nostr);

  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const rootEventTagToPreview = event.tags?.filter((t) => t[0] === "e" && t[1])?.map((t) => t[1]);
  let previewEvent = events.rootNotes.find((e: Event)  => (rootEventTagToPreview && e.id === rootEventTagToPreview[0]));
  const previewEventImages = GetImageFromPost(previewEvent?.content ?? "");
  const previewEventVideo = getYoutubeVideoFromPost(previewEvent?.content ?? "");

  const images = GetImageFromPost(event.content);
  const youtubeFromPost = getYoutubeVideoFromPost(event.content);
  const writableRelayUrls = nostr.relays.filter((r) => r.write).map((r) => r.relayUrl);
  const hashTagsFromNote = event.tags?.filter((t) => t[0] === 't').map((t) => t[1]);
  const dispatch = useDispatch();
  const dicebear = DiceBears();
  const handleExpandClick = useCallback(() => {
    setExpanded((expanded) => !expanded);
  }, []);
  
  const handleFollowButtonClicked = useCallback(() => {
    updateFollowing(event.pubkey);
    setIsFollowing((isFollowing) => !isFollowing);
  }, [updateFollowing, event.pubkey]);
  
  const likeNote = useCallback(async () => {
    if (!pool) return;
    
    //Construct the event
    const _baseEvent = {
      kind: Kind.Reaction,
      content: "+",
      created_at: Math.floor(Date.now() / 1000),
      tags: [
          ["e", event.id],
          ["p", event.pubkey],
      ],
    } as EventTemplate
    
    setLiked(true)

    const shouldSignWithNostr = window.nostr && keys.privateKey.decoded === "";
    if (shouldSignWithNostr){
      const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent, dispatch);
      if (signedWithNostr) {
        setLiked(signedWithNostr)
        return;
      }
    }

    const signedManually = await signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent, dispatch);
    setLiked(signedManually);

  }, [pool, nostr.relays, event]);

  useEffect(() => {
    const checkFollowing = nostr.following.includes(event.pubkey);
    if (checkFollowing){
      setIsFollowing(checkFollowing);
    }
  }, [nostr.following])

  const showReplyThread = useCallback(() => {
    dispatch(setNoteModalEvent(event));
  }, []);

  const addHashtag = (tag: string) => {
    dispatch(addHashTag(tag));
  }

  const handleReplyToNote = () => {
    console.log("reply to note modal open", event);
    dispatch(setReplyToNoteEvent(event));
  }

  return (
    <Paper elevation={3} sx={{ width: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={events.metaData[event.pubkey]?.picture ?? dicebear}>
          </Avatar>
        }
        title={events.metaData[event.pubkey]?.name ?? ""}
        subheader={events.metaData[event.pubkey]?.nip05 ?? ""}
        subheaderTypographyProps={{color: themeColors.textColor}}
        style={{color: themeColors.textColor}}
      />
      <CardContent >
        {!note.imageOnlyMode &&
          <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize ,overflowWrap: 'normal' }}>
          {event.content}
          </Typography>
         }
        
        <Box>
          {(images?.length ?? 0) > 0 && (
            images.map((img) => (
            <CardMedia
              component="img"
              image={img}
              alt="picture"
              key={img + "normalModeImage" + isInModal}
              sx={{maxHeight: "400px", objectFit: "contain", color: themeColors.textColor}}
            />
            ))
          )}
          {youtubeFromPost && (
            <iframe 
            src={youtubeFromPost} 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ width: '100%', height: '350px' }}
          />
          )}
        </Box>
      </CardContent>
      <CardContent>
        {hashTagsFromNote
          .filter((tag) => hashTagsFromNote.indexOf(tag) === hashTagsFromNote.lastIndexOf(tag))
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

      {previewEvent && !note.imageOnlyMode && (
        <CardContent sx={{margin: "2%"}}>
          <Card 
            elevation={4}
            onClick={() => dispatch(addSearchEventId(previewEvent?.id))}
            sx={{ 
              marginBottom: "10px", 
              color: themeColors.textColor, 
              backgroundColor: themeColors.background, 
              fontSize: themeColors.textSize
              }}>
                <Grid container direction="column" > 

                    <Grid item xs={4}>
                        <CardHeader
                                avatar={
                                  <Avatar src={events.metaData[previewEvent.pubkey]?.picture ?? dicebear} sx={{width: 24, height: 24}}/>
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

                <Box>
                  {(previewEventImages?.length ?? 0) > 0 && (
                    previewEventImages.map((img) => (
                    <CardMedia
                      component="img"
                      image={img}
                      alt="picture"
                      key={img + "previewEventImage" + isInModal}
                      sx={{maxHeight: "250px", objectFit: "contain", color: themeColors.textColor, marginBottom: "10px"}}
                    />
                    ))
                  )}
                  {previewEventVideo && (
                    <iframe 
                    src={previewEventVideo} 
                    title="YouTube video player" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ width: '100%', height: '315px', marginBottom: "10px" }}
                  />
                  )}
              </Box>
          </Card>
        </CardContent>
      )}

      <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{color: themeColors.textColor}}>
          {moment.unix(event.created_at).fromNow()}
        </Typography>
        <Box sx={{display: 'flex', alignContent: "flex-start", justifyContent: 'start'}}>
        <IconButton aria-label="cart" onClick={showReplyThread}>
          <StyledBadge color="secondary">
            {<Badge badgeContent={events.replyNotes[event.id]?.length ?? 0} color="primary"><ForumIcon color="primary"/></Badge> }
          </StyledBadge>
        </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            onClick={() => disableReplyIcon === true ? () => {} : handleReplyToNote()}
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
            {(events.reactions[event.id]?.length ?? 0) + (liked ? 1 : 0)}
          </Typography>
            <FavoriteIcon id={"favorite-icon-" + event.sig} />
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
        {note.imageOnlyMode &&
          <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize ,overflowWrap: 'normal' }}>
          {event.content}
          </Typography>
         }
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
    </Paper>
  );
}

export default React.memo(Note);