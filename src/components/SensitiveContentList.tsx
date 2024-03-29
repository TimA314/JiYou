import { Box, Button, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { ThemeContext } from '../theme/ThemeContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addHideExplicitTag, removeHideExplicitTag } from '../redux/slices/noteSlice';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';

type Props = {}

const SensitiveContentList = (props: Props) => {
    const { themeColors } = useContext(ThemeContext);
    const note = useSelector((state: RootState) => state.note);
    const dispatch = useDispatch();
    const [tag, setTag] = useState<string>("");
    const [showTags, setShowTags] = useState(false); 

    const handleDeleteTag = (tag: string) => {
        dispatch(removeHideExplicitTag(tag));
    };

    const handleTagChange = (e: { target: { value: string; }; }) => {
        const val: string = e.target.value;
        if (e.target.value !== '') {
            setTag(val);
        }
    }

    const handleAddTag = () => {
        if (tag && tag.trim() !== '') {
            dispatch(addHideExplicitTag(tag));
            setTag('');
        }
    }

    return (
    <Box>
        <Grid container direction='column' alignItems="start">
            <Grid item>
                <Typography variant='body1' style={{color: themeColors.secondary}}>
                    Sensitive Content Settings
                </Typography>
                <Typography variant='caption' style={{color: themeColors.textColor}}>
                    Tags added here will be hidden from your feed when "Hide Sensetive Content is checked.".
                </Typography>
            </Grid>
            <Grid display="flex" alignItems="center">
                <Grid item>
                    <Box onClick={() => setShowTags(!showTags)}>
                        {showTags ? <UnfoldLessIcon sx={{color: themeColors.textColor }}/> : <UnfoldMoreIcon sx={{color: themeColors.textColor }}/>}
                    </Box>
                </Grid>
                <Grid item>
                    <TextField
                        type="string"
                        label="New Tag"
                        variant="outlined"
                        size='small'
                        value={tag}
                        sx={{ marginRight: '1rem', color: themeColors.textColor }}
                        InputLabelProps={{sx: {color: themeColors.textColor}}}
                        onChange={handleTagChange}
                        InputProps={{
                            style: { color: themeColors.textColor},
                        }}
                        />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" size='small' color="primary" onClick={handleAddTag}>
                        Add Tag To Hide
                    </Button>
                </Grid>
            </Grid>
            {showTags && (
                    <List style={{color: themeColors.textColor}}>
                        {note.explicitTags.map((tag, index) => (
                            <ListItem key={index}>
                                <ListItemText color={themeColors.textColor} primary={tag} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => handleDeleteTag(tag)}>
                                    <DeleteIcon color='error' />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
        </Grid>
    </Box>
  )
}
export default SensitiveContentList
