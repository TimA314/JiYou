import * as React from 'react';
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
import { GetImageFromPost } from '../util';
import DropDown from './DropDown';
import { DiceBears } from '../util';
import { EventWithProfile } from '../nostr/Types';

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
    event: EventWithProfile;
}

export default function Note(props: NoteProps) {
  const [expanded, setExpanded] = React.useState(false);
  const imageFromPost = GetImageFromPost(props.event.content);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  //Set Profile Content and Profile Picture
  let profileContent = null;
  let profilePicture = DiceBears();
  if (props && props.event.profileEvent && props.event.profileEvent.content){
    profileContent = JSON.parse(props.event.profileEvent.content);
    if (profileContent.picture) profilePicture = profileContent.picture;
  } 

  
  return (
    <Card sx={{ maxWidth: "100%", margin: "10px", alignItems: "flex-start"}}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: purple[500] }} aria-label="recipe" src={profilePicture}>
          </Avatar>
        }
        action={
            <DropDown event={props.event} />
        }
        title={profileContent ? profileContent.display_name : "Unknown"}
        subheader={profileContent?.nip05 ? profileContent.nip05 : ""}
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
        {props.event.content}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <Typography variant="subtitle2">
        {moment.unix(props.event.created_at).fromNow()}
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
        <CardContent sx={{}}>
          <Typography paragraph display="h6">MetaData:</Typography>
          <Typography variant="caption" display="block">
            Event Id: {props.event.id}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            PubKey hex: {props.event.pubkey}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Created: {moment.unix(props.event.created_at).format("LLLL")}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            UnixTime: {props.event.created_at}
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Sig: {props.event.sig}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}