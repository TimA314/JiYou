import { Box, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material'
import { useContext } from 'react'
import { ThemeContext } from '../theme/ThemeContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { removeHideExplicitTag } from '../redux/slices/noteSlice';

type Props = {}

const SensitiveContentList = (props: Props) => {
    const { themeColors } = useContext(ThemeContext);
    const note = useSelector((state: RootState) => state.note);
    const dispatch = useDispatch();

    const handleDeleteTag = (tag: string) => {
        dispatch(removeHideExplicitTag(tag));
    };

    return (
    <Box>
        <Typography variant='h6'style={{color: themeColors.textColor}}>Hide Tags</Typography>
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

    </Box>
  )
}
export default SensitiveContentList