import { CircularProgress, Button, Typography, styled } from '@mui/material';

const CenteredContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
});

const StyledCircularProgress = styled(CircularProgress)({
    color: 'green',
    marginBottom: '20px',
});

const StyledButton = styled(Button)({
    marginTop: '20px',
    backgroundColor: 'blue',
    color: 'white',
});

const QuizResults = ({ score, handleGenerateAnotherQuiz }) => {
    const percentage = (score / 5) * 100;

    return (
        <CenteredContainer>
            <Typography variant="h5" gutterBottom>
                Your Score: {score}
            </Typography>

            <StyledCircularProgress variant="determinate" value={percentage} size={100} thickness={3.6} />

            <StyledButton variant="contained" onClick={handleGenerateAnotherQuiz}>
                Generate Another Quiz
            </StyledButton>
        </CenteredContainer>
    );
};

export default QuizResults;
