import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment/moment';
import { Badge, BadgeProps, Box } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { nip19, EventTemplate, Event } from 'nostr-tools';
import { DiceBears} from '../../utils/miscUtils';
import { signEventWithNostr, signEventWithStoredSk } from '../../nostr/FeedEvents';
import ForumIcon from '@mui/icons-material/Forum';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ThemeContext } from '../../theme/ThemeContext';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { addHashTag, setNoteModalEvent, setReplyToNoteEvent, setProfileEventToShow } from '../../redux/slices/noteSlice';
import { PoolContext } from '../../context/PoolContext';
import { useNavigate } from 'react-router-dom';
import { clearCurrentProfileNotes, setRefreshingCurrentProfileNotes } from '../../redux/slices/eventsSlice';
import { addFollowing } from '../../redux/slices/nostrSlice';
import { getMediaNostrBandImageUrl } from '../../utils/eventUtils';
import BoltIcon from '@mui/icons-material/Bolt';
import * as invoice from 'light-bolt11-decoder'
import { ZapAmountModal } from '../ZapAmountModal';
import NoteDetails from './NoteDetails';
import PreviewEvent from './PreviewEvent';
import NoteMedia from './NoteMedia';

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
const ReactionIconButton = styled(IconButton)(({ }) => ({
  '&.animateLike': {
    animation: '$scaleAnimation 0.3s ease-in-out'
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
  isInModal?: boolean;
  disableImagesOnly?: Boolean;
  onNoteHeightChange: (index: number, height: number) => void;
  noteIndex: number;
}

const Note: React.FC<NoteProps> = ({
    event,
    disableReplyIcon, 
    updateFollowing,
    isInModal = false,
    disableImagesOnly,
    onNoteHeightChange,
    noteIndex
  }: NoteProps) => {

  const { themeColors } = useContext(ThemeContext);
  const pool = useContext(PoolContext);

  const keys = useSelector((state: RootState) => state.keys);
  const events = useSelector((state: RootState) => state.events);
  const note = useSelector((state: RootState) => state.note);
  const nostr = useSelector((state: RootState) => state.nostr);
  
  const [zapped, setZapped] = useState(false);
  const [zappedAmount, setZappedAmount] = useState(0);
  const [zapAmountChipsVisible, setZapAmountChipsVisible] = useState(false);

  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const [shouldCalculateHeight, setShouldCalculateHeight] = useState(false);
  const noteContainerRef = useRef<HTMLDivElement | null>(null);

  const dicebear = DiceBears();
  const noteAvatar = getMediaNostrBandImageUrl(event.pubkey, "picture", 64);
  const hashTagsFromNote = event.tags?.filter((t) => t[0] === 't').map((t) => t[1]);
  const writableRelayUrls = nostr.relays.filter((r) => r.write).map((r) => r.relayUrl);
  
  const rootEventTagToPreview = event.tags?.filter((t) => t[0] === "e" && t[1])?.map((t) => t[1]);
  const previewEvent = events.rootNotes.find((e: Event)  => (rootEventTagToPreview && e.id === rootEventTagToPreview[0]));

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const zapsForNote: Event[] | null = events.zaps[event.id];
    if(!zapsForNote) return;

    let amount = 0;
    zapsForNote.forEach(z => {
      const bolt = z.tags.find(t => t[0] === "bolt11")?.[1]
      if (bolt) {
        const decoded = invoice.decode(bolt);
        if(!decoded) return;
        const amountSection = decoded.sections.find((section: { name: string; }) => section.name === 'amount');
        const decodedAmount = amountSection ? Number(amountSection.value) / 1000 : 0;
        amount += decodedAmount;
      }
    });
    setZappedAmount(amount);
  
  },[events.zaps]);
  
  const handleExpandClick = useCallback(() => {
    setExpanded((expanded) => !expanded);
  }, []);


  const handleFollowButtonClicked = useCallback(() => {
    dispatch(addFollowing(event.pubkey));
    updateFollowing(event.pubkey);
    setIsFollowing((isFollowing) => !isFollowing);
  }, [updateFollowing, event.pubkey]);
  
  const likeNote = async () => {
    if (!pool) return;
    
    //Construct the event
    const _baseEvent = {
      kind: 7,
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

  };

  const handleZapNote = async () => {
    if (zapAmountChipsVisible){
      setZapAmountChipsVisible(false);
      return;
    }
    setZapAmountChipsVisible(true);
  }

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
    dispatch(setReplyToNoteEvent(event));
  }

  const handleNoteHeaderClicked = () => {
    dispatch(setProfileEventToShow(event))
    dispatch(clearCurrentProfileNotes());
    dispatch(setRefreshingCurrentProfileNotes(true));
    navigate("/profile");
  }

  // React Window Height Calculation
  
  useEffect(() => {
    if (shouldCalculateHeight) return;
    setShouldCalculateHeight(true);
  }, [previewEvent, expanded]);

  useEffect(() => {
    if (shouldCalculateHeight) {
      calculateHeight();
      setShouldCalculateHeight(false);
    }
  }, [shouldCalculateHeight]);

  const calculateHeight = () => {  

      if (noteContainerRef.current) {
          const height = noteContainerRef.current.getBoundingClientRect().height;
          onNoteHeightChange(noteIndex, height);
      }
  };
  
  // End React Window Height Calculation

  return (
    <Card 
      elevation={3}  
      sx={{
        width: "100%", 
        alignItems: "flex-start", 
        borderRadius: "15px",
      }}
      >
      <CardHeader
        onClick={handleNoteHeaderClicked}
        avatar={
          <Avatar 
            aria-label="recipe" 
            src={noteAvatar} 
            alt={events.metaData[event.pubkey]?.picture ?? dicebear}
            sizes="small">
          </Avatar>
        }
        title={events.metaData[event.pubkey]?.name ?? nip19.npubEncode(event.pubkey).slice(0, 8) + "..." }
        subheader={events.metaData[event.pubkey]?.nip05 ?? ""}
        subheaderTypographyProps={{color: themeColors.textColor}}
        style={{color: themeColors.textColor}}
      />
      <CardContent sx={{padding: "2px"}}>
        {(!note.imageOnlyMode || disableImagesOnly) && 
          <Box sx={{padding: 2}}>
            <Typography variant="body2" sx={{ color: themeColors.textColor, fontSize: themeColors.textSize ,overflowWrap: 'normal' }}>
            {event.content}
            </Typography>
          </Box>
         }
          
      <NoteMedia 
        setShouldCalculateHeight={setShouldCalculateHeight} 
        event={event} 
      />
          
      </CardContent>
      <CardContent>
        {hashTagsFromNote?.length > 0 && hashTagsFromNote
          .filter((tag) => hashTagsFromNote.indexOf(tag) === hashTagsFromNote.lastIndexOf(tag))
          .map((tag) => (
            <Typography
            variant="caption"
            color="primary"
            key={tag + event.sig}
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

      {previewEvent && (!note.imageOnlyMode || disableImagesOnly) && (
        <CardContent sx={{padding: 2}}>
          <PreviewEvent previewEvent={previewEvent} setShouldCalculateHeight={setShouldCalculateHeight} />
        </CardContent>
      )}

      <Box 
        sx={{
          display: 'flex', 
          alignContent: "flex-end", 
          justifyContent: 'end', 
          marginRight: '2.1rem',
          position: 'relative'
        }}>
        <ZapAmountModal visible={zapAmountChipsVisible} setVisible={setZapAmountChipsVisible} setZapped={setZapped} setZappedAmount={setZappedAmount} eventToZap={event}/>
      </Box>

      <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{color: themeColors.textColor}}>
          {moment.unix(event.created_at).fromNow()}
        </Typography>
        <Box sx={{display: 'flex', alignContent: "flex-start", justifyContent: 'start'}}>
        <IconButton onClick={showReplyThread}>
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

          <ReactionIconButton 
            aria-label="Upvote note" 
            onClick={likeNote} 
            sx={{ color: liked ? themeColors.primary : themeColors.textColor }}
            className={liked ? 'animateLike' : ''}
          >
          <Typography variant='caption' sx={{color: themeColors.textColor}}>
            {(events.reactions[event.id]?.length ?? 0) + (liked ? 1 : 0)}
          </Typography>
            <FavoriteIcon id={"favorite-icon-" + event.sig} />
          </ReactionIconButton>

          <ReactionIconButton
            arie-label="zap note"
            onClick={handleZapNote}
            sx={{ color: zapped ? themeColors.secondary : themeColors.textColor }}
            className={zapped ? 'animateLike' : ''}
            >
              <Typography variant='caption' sx={{color: themeColors.textColor}}>
                {zappedAmount}
              </Typography>
              <BoltIcon id={"zap-icon-" + event.sig} />
          </ReactionIconButton>

          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show metadata"
            sx={{color: themeColors.textColor}}
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </Box>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {
            note.imageOnlyMode && 
              <NoteDetails 
                event={event} 
                isFollowing={isFollowing} 
                handleFollowButtonClicked={handleFollowButtonClicked}
                />
          }
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default React.memo(Note);