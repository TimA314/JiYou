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
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment/moment';
import { GetImageFromPost } from '../util';
import { FullEventData } from '../nostr/Types';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { SimplePool, nip19 } from 'nostr-tools';

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
  pool: SimplePool | null;
}

export default function Note({eventData, pool}: NoteProps) {
  const [expanded, setExpanded] = useState(false);
  const [isFollowing, setIsFollowing] = useState<Boolean>(false)
  const imageFromPost = GetImageFromPost(eventData.content);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleFollowButtonClicked = () => {
    setIsFollowing(!isFollowing);
    //updateFollowerEvent();
  }

  return (
    <Card sx={{ maxWidth: "100%", marginTop: "10px", alignItems: "flex-start"}}>
      <CardHeader
        avatar={
          <Avatar aria-label="recipe" src={eventData.user.picture}>
          </Avatar>
        }
        title={eventData.user.name}
        subheader={eventData.user.nip05}
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
        {eventData.content}
        </Typography>
      </CardContent>
      <CardContent>
        {eventData.hashtags
          .filter((tag) => eventData.hashtags.indexOf(tag) === eventData.hashtags.lastIndexOf(tag))
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
        {moment.unix(eventData.created_at).fromNow()}
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
            Event Id: {eventData.eventId}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey: {nip19.npubEncode(eventData.user.pubKey)}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey hex: {eventData.user.pubKey}
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
        </CardContent>
      </Collapse>
    </Card>
  );
}