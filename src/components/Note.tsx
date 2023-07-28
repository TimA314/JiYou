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
import { FullEventData, MetaData, RelaySetting } from '../nostr/Types';
import { Badge, BadgeProps, Box, Button, CircularProgress, Grid } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { SimplePool, nip19, EventTemplate, Kind, Event } from 'nostr-tools';
import { GetImageFromPost, getYoutubeVideoFromPost } from '../utils/miscUtils';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import ForumIcon from '@mui/icons-material/Forum';
import NoteModal from './NoteModal';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplyToNote from './ReplyToNote';
import { ThemeContext } from '../theme/ThemeContext';
import React from 'react';
import { sanitizeString } from '../utils/sanitizeUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
  event: Event;
  replyEvents: Record<string, Event[]>;
  rootEvents: Record<string, Event[]>;
  reactions: Record<string, Event[]>;
  metaData: Record<string, MetaData>;
  pool: SimplePool | null;
  relays: RelaySetting[];
  fetchEvents: boolean;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
  following: string[];
  updateFollowing: (pubkey: string) => void;
  setHashtags:  React.Dispatch<React.SetStateAction<string[]>>;
  disableReplyIcon?: boolean;
  gettingThread?: boolean;
  hashTags: string[];
  imagesOnlyMode?: React.MutableRefObject<boolean>;
  isInModal?: boolean;
}

const Note: React.FC<NoteProps> = ({
    pool, 
    relays,
    fetchEvents, 
    setFetchEvents,
    event,
    replyEvents,
    rootEvents,
    reactions,
    metaData,
    following, 
    setHashtags, 
    disableReplyIcon, 
    gettingThread,
    hashTags,
    updateFollowing,
    imagesOnlyMode,
    isInModal = false,
  }: NoteProps) => {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [noteDetailsOpen, setNoteDetailsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(following.includes(event.pubkey));
  const [replyToNoteOpen, setReplyToNoteOpen] = useState(false);
  const { themeColors } = useContext(ThemeContext);
  const [showImagesOnly ] = useState(imagesOnlyMode?.current ?? false);
  const keys = useSelector((state: RootState) => state.keys);

  const rootEventTagToPreview = event.tags.find((t) => t[0] === "e" && t[3] === "root");
  const backupRootEventTagToPreview = event.tags.find((t) => t[0] === "e" && t[1]);
  const previewEvent = rootEvents[rootEventTagToPreview?.[1] ?? backupRootEventTagToPreview?.[1] ?? ""]?.[0];
  const previewEventImages = GetImageFromPost(previewEvent?.content ?? "");
  const previewEventVideo = getYoutubeVideoFromPost(previewEvent?.content ?? "");
  const images = GetImageFromPost(event.content);
  const youtubeFromPost = getYoutubeVideoFromPost(event.content);
  const writableRelayUrls = relays.filter((r) => r.write).map((r) => r.relayUrl);
  const hashtags = event.tags.filter((t) => t[0] === 't').map((t) => t[1]);

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
      const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
      if (signedWithNostr) {
        setLiked(signedWithNostr)
        return;
      }
    }

    const signedManually = await signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent);
    setLiked(signedManually);

  }, [pool, relays, event]);

  const showReplyThread = useCallback(() => {
    setNoteDetailsOpen(true);
  }, []);

  const addHashtag = (tag: string) => {
    console.log("add hashtag", tag)
    setHashtags(hashtags => [...hashtags, tag]);
    setFetchEvents(true);
  }

  const handleReplyToNote = (eventData: Event) => {
    console.log("reply to note", eventData);
    setReplyToNoteOpen(true);
  }

  //Images Only Mode
  if (imagesOnlyMode && imagesOnlyMode.current && showImagesOnly && !isInModal) {
    return (
      <Card sx={{marginBottom: "15px"}}>
        <NoteModal
          fetchEvents={fetchEvents}
          reactions={reactions}
          metaData={metaData}
          setFetchEvents={setFetchEvents}
          event={event}
          replyEvents={replyEvents}
          rootEvents={rootEvents}
          open={noteDetailsOpen}
          setNoteDetailsOpen={setNoteDetailsOpen}
          pool={pool}
          relays={relays}
          following={following}
          updateFollowing={updateFollowing}
          setHashtags={setHashtags}
          hashTags={hashTags}
          imagesOnlyMode={imagesOnlyMode}
          />
        <CardContent sx={{margin: "-16px"}}>
          {(images?.length ?? 0) > 0 && (
            images.map((img) => (
            <CardMedia
              component="img"
              image={img}
              alt="picture"
              key={img + "imageOnlyModeImage" + isInModal}
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
        </CardContent>
        <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <CardHeader
          avatar={
            <Avatar sizes='small' aria-label="recipe" src={metaData[event.id].picture}>
            </Avatar>
          }
          title={moment.unix(event.created_at).fromNow()}
          titleTypographyProps={{color: themeColors.textColor}}
        />
          <Box sx={{display: 'flex', alignContent: "flex-start", justifyContent: 'start'}}>
          <IconButton aria-label="cart" onClick={showReplyThread}>
            <StyledBadge color="secondary">
              {gettingThread ? <CircularProgress /> : <Badge badgeContent={replyEvents[event.id]?.length ?? ""} color="primary"><ForumIcon color="primary"/></Badge> }
            </StyledBadge>
          </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton 
              onClick={() => disableReplyIcon ? () => {} : handleReplyToNote(event)}
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
              {(reactions[event.id].filter(e => e.content !== '-')?.length ?? 0) + (liked ? 1 : 0)}
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
          <Box sx={{display: 'flex', alignContent: "flex-end", justifyContent: 'end'}}>
            <Button variant="outlined" color={isFollowing ? "primary" : "success"} onClick={handleFollowButtonClicked}>
              {isFollowing ? "UnFollow" : "Follow"}
            </Button>
          </Box>
          <Typography variant="h6" sx={{color: themeColors.textColor, fontSize: themeColors.textSize}}>
            Content:
          </Typography>
          <Box sx={{marginBottom: "20px", margin: "10px"}}>
            <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize}}>
              {event.content}
            </Typography>
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
      <ReplyToNote
        fetchEvents={fetchEvents}
        setFetchEvents={setFetchEvents}
        open={replyToNoteOpen} 
        setReplyToNoteOpen={setReplyToNoteOpen} 
        event={event}
        rootEvents={rootEvents}
        replyEvents={replyEvents}
        metaData={metaData}
        reactions={reactions}
        pool={pool} 
        relays={relays} 
        following={following} 
        updateFollowing={updateFollowing} 
        setHashtags={setHashtags}
        hashTags={hashTags}
        imagesOnlyMode={imagesOnlyMode}
        />
      </Card>
    )
  }


  //Normal Mode
  return (
    <Card elevation={3} sx={{ width: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <NoteModal
        fetchEvents={fetchEvents}
        setFetchEvents={setFetchEvents}
        event={event}
        replyEvents={replyEvents}
        rootEvents={rootEvents}
        metaData={metaData}
        reactions={reactions}
        open={noteDetailsOpen}
        setNoteDetailsOpen={setNoteDetailsOpen}
        pool={pool}
        relays={relays}
        following={following}
        updateFollowing={updateFollowing}
        setHashtags={setHashtags}
        hashTags={hashTags}
        imagesOnlyMode={imagesOnlyMode}
         />
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={metaData[event.id]?.picture ?? ""}>
          </Avatar>
        }
        title={metaData[event.id]?.name ?? ""}
        subheader={metaData[event.id]?.nip05 ?? ""}
        subheaderTypographyProps={{color: themeColors.textColor}}
        style={{color: themeColors.textColor}}
      />
      <ReplyToNote
        fetchEvents={fetchEvents}
        setFetchEvents={setFetchEvents}
        open={replyToNoteOpen} 
        setReplyToNoteOpen={setReplyToNoteOpen} 
        event={event}
        replyEvents={replyEvents}
        rootEvents={rootEvents}
        metaData={metaData}
        reactions={reactions}
        pool={pool} 
        relays={relays} 
        following={following} 
        updateFollowing={updateFollowing} 
        setHashtags={setHashtags}
        hashTags={hashTags}
        imagesOnlyMode={imagesOnlyMode}
        />
      <CardContent >
        <Typography variant="body2" sx={{color: themeColors.textColor, fontSize: themeColors.textSize ,overflowWrap: 'normal' }}>
        {event.content}
        </Typography>
        <Box>
          {(images?.length ?? 0) > 0 && (
            images.map((img) => (
            <CardMedia
              component="img"
              image={img}
              alt="picture"
              key={img + "normalModeImage" + isInModal}
              sx={{maxHeight: "300px", objectFit: "contain", color: themeColors.textColor}}
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
        {hashtags
          .filter((tag) => hashtags.indexOf(tag) === hashtags.lastIndexOf(tag))
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

      {previewEvent && (
        <CardContent sx={{margin: "5%"}}>
          <Card elevation={4} sx={{ marginBottom: "10px", color: themeColors.textColor, fontSize: themeColors.textSize}}>
                <Grid container direction="column" > 

                    <Grid item xs={4}>
                        <CardHeader
                                avatar={
                                  <Avatar src={metaData[previewEvent.id].picture} sx={{width: 24, height: 24}}/>
                                }
                                title={metaData[previewEvent.id].name}
                                subheader={metaData[previewEvent.id].nip05}
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
            {gettingThread ? <CircularProgress /> : <Badge badgeContent={replyEvents[event.id]?.length ?? 0} color="primary"><ForumIcon color="primary"/></Badge> }
          </StyledBadge>
        </IconButton>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton 
            onClick={() => disableReplyIcon ? () => {} : handleReplyToNote(event)}
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
            {(reactions[event.id]?.filter(e => e.content !== "-")?.length ?? 0) + (liked ? 1 : 0)}
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
    </Card>
  );
}

export default React.memo(Note);