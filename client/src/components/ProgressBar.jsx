import { styled, useTheme } from '@mui/system';
import LinearProgress from '@mui/material/LinearProgress';


const CustomProgressBar = styled(LinearProgress)({
    height: '20px', 
    borderRadius: '20px',
    margin: 'auto'
  });

export default function ProgressBar({ activeStep }) {
    const theme = useTheme();
  
    return (
      <CustomProgressBar
        variant="determinate"
        value={(activeStep / 5) * 100}
        sx={{
          maxWidth: 400,
          flexGrow: 1,
          backgroundColor: theme.palette.grey[200],
          marginBottom: 2
        }}
      />
    );
  }
  