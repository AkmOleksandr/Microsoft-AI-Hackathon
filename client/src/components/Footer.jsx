import { Paper, Container, Box, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';

const Footer = () => {
    return (
        <Paper sx={{
            marginTop: 'calc(10% + 60px)',
            width: '100%',
            position: 'sticky',
            bottom: 0,
        }} component="footer" square variant="outlined">
            <Container maxWidth="lg">
                <Box
                    sx={{
                        flexGrow: 1,
                        justifyContent: "center",
                        display: "flex",
                        my: 1
                    }}
                >
                    <div>
                        <EditNoteIcon />
                    </div>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        justifyContent: "center",
                        display: "flex",
                        mb: 1,
                    }}
                >
                    <Typography variant="caption" color="initial">
                        LeetTutor ©2023.
                    </Typography>
                </Box>
            </Container>
        </Paper>
    );
}

export default Footer 