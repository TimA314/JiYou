import { Box, Button, Container, Grid, Link, TextField, Typography } from '@mui/material'
import { ThemeContext } from '../theme/ThemeContext';
import React, { useContext, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type Props = {}

export default function About({}: Props) {
const { themeColors } = useContext(ThemeContext);
const [copied, setCopied] = useState(false);


const handleCopy = () => {
    navigator.clipboard.writeText('lnurl1dp68gurn8ghj7ampd3kx2ar0veekzar0wd5xjtnrdakj7tnhv4kxctttdehhwm30d3h82unvwqhh2mnjd9cx2mt9v9eh2un9xccqeus5uj');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Show copied status for 2 seconds
  }

  return (
    <Container sx={{color: themeColors.textColor}}>
    <Box>
        <Typography variant="h2" align="center" gutterBottom color={themeColors.secondary}>
        About Jiyou
        </Typography>

        <Typography variant="body1" paragraph>
        Inspired by 自由【じゆう】which is the Japanese word for freedom. JiYou is a Nostr client built for
        complete user customization.  
        It serves as a portal to a simple, open protocol that enables global, decentralized, 
        and censorship-resistant social media.
        </Typography>

        <Typography variant="body1" paragraph>
        JiYou's search functionality is designed to enable users to customize their feed to topics 
        they're interested in without any closed source algorithmic interference. 
        </Typography>

        <Typography variant="body1" paragraph>
        (Note: It is highly recommended you install a Nostr Extension to secure your account.)
        </Typography>

        <Typography variant="body1" paragraph>
        Learn more about Nostr <Link href="https://nostr.how/">here</Link>.
        </Typography>

        <Box my={4} display="flex" justifyContent="center">
            <Grid container justifyContent="center" spacing={2}>
                <Grid item xs={12} sm={8}>
                    <TextField
                    fullWidth
                    variant="outlined"
                    sx={{color: themeColors.textColor}}
                    value='lnurl1dp68gurn8ghj7ampd3kx2ar0veekzar0wd5xjtnrdakj7tnhv4kxctttdehhwm30d3h82unvwqhh2mnjd9cx2mt9v9eh2un9xccqeus5uj'
                    InputProps={{
                        readOnly: true,
                        sx: {color: themeColors.primary}
                    }}
                    />
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={handleCopy}>
                        <ContentCopyIcon /> {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </Grid>
            </Grid>
            <Typography variant="body1" align="center" paragraph color={themeColors.textColor}>
                Any generous donations will keep JiYou free and open to everyone. 
                Your contribution, no matter how small, makes a big difference!
            </Typography>
        </Box>
    </Box>
  </Container>
  )
}