import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Container, Grid, Link, TextField, Typography } from '@mui/material'
import { ThemeContext } from '../theme/ThemeContext';
import { useContext, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

        <Typography variant="body2" paragraph>
            Inspired by 自由【じゆう】which is the Japanese word for freedom. JiYou is a Nostr client built for
            complete user customization.  
            It serves as a portal to a simple, open protocol that enables global, decentralized, 
            and censorship-resistant social media.
        </Typography>

        <Typography variant="body2" paragraph>
            🔍 Use JiYou's search bar to fine tune your feed with topics you are interested in. 
        </Typography>

        <Typography variant="body2" paragraph>
            Customize the look and feel of JiYou in the settings page. 
        </Typography>

        <Typography variant="body2" paragraph>
            🌐 JiYou is a web app that can be installed on your phone.
        </Typography>
        <Box my={2} sx={{color: themeColors.textColor}}>
          <Accordion sx={{color: themeColors.textColor}}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{color: themeColors.textColor}} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="body1">Android</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                1. Open JiYou in Chrome on your Android device.<br />
                2. Tap the menu button (three vertical dots in the top-right corner).<br />
                3. Tap "Add to Home screen".<br />
                4. Tap "Add" in the confirmation dialog.<br />
                5. The app will now be installed and can be accessed from your home screen.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{color: themeColors.textColor}}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{color: themeColors.textColor}} />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography variant="body1">iOS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                1. Open JiYou in Safari on your iOS device.<br />
                2. Tap the share button (a box with an arrow pointing upward).<br />
                3. Scroll down and tap "Add to Home Screen".<br />
                4. Tap "Add" in the top-right corner.<br />
                5. The app will now be installed and can be accessed from your home screen.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Typography variant="body2" paragraph>
            (Note: It is highly recommended you install a Nostr Extension to secure your account.
            This may not be possible on mobile at the moment.)
        </Typography>

        <Typography variant="body2" paragraph>
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
                JiYou is meant to be free for everyone but there are some costs to operate. Any donation is welcome!
            </Typography>
        </Box>
    </Box>
  </Container>
  )
}