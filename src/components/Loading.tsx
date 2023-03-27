import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

export default function LinearColor() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack sx={{ width: '100%'}} spacing={2}>
        <LinearProgress color="primary" />
        <LinearProgress color="error" />
        <LinearProgress color="secondary" />
        </Stack>
    </div>
  );
}