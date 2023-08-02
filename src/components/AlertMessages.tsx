import { Box, Fade, Stack, Typography } from '@mui/material'
import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeMessage } from '../redux/slices/noteSlice';
import { ThemeContext } from '../theme/ThemeContext';

type Props = {
    messages: AlertMessage[]
}

export type AlertMessage = {
    message: string,
    isError: boolean
}


export const AlertMessages = ({ messages }: Props) => {
    const { themeColors } = useContext(ThemeContext);
    const dispatch = useDispatch();

    useEffect(() => {
        messages.forEach(message => {
            setTimeout(() => {
                dispatch(removeMessage(message));
            }, 6000);
        });
    }, [messages, dispatch]);

    if (messages.length > 0) {
        return (
            <Stack
                sx={{
                    position: 'fixed',
                    top: 60,
                    left: 0,
                    zIndex: 9999, // ensure it floats over everything else
                    margin: 1,
                }}
            >
                {
                    messages.map((m, index) => {
                        return (
                            <Fade key={index} in={m.message.length > 0} timeout={{ enter: 3000, exit: 3000 }}>
                                <Box
                                    sx={{
                                        color: m.isError ? themeColors.secondary : themeColors.textColor,
                                        padding: 1,
                                    }}
                                >
                                    <Typography variant='caption'>{m.message}</Typography>
                                </Box>
                            </Fade>
                        )
                    })
                }
            </Stack>
        )
    } else {
        return (<></>)
    }
}
