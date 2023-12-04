import { useState } from "react";
import { Paper, Typography, Button, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import ProgressBar from './ProgressBar'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

const QuizTaker = ({ questions, currentIndex, onNavigateNext, setScore }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const currentQuestion = questions[currentIndex];

    const handleOptionSelect = (option) => {
        if (!submitted) {
            setSelectedOption(option);
        }
    };

    const handleNext = () => {
        if (submitted && currentIndex === questions.length - 1) {
            onNavigateNext();
        } else if (submitted) {
            onNavigateNext();
            setSelectedOption(null);
            setSubmitted(false);
        }
    };

    const handleSubmit = () => {
        if (!submitted && selectedOption !== null) {
            const isCorrect = selectedOption === currentQuestion.correct_answer;
            if (isCorrect) {
                setScore((prevScore) => prevScore + 1);
            }
            setSubmitted(true);
        }
    };

    return (
        <Paper sx={{ maxWidth: 800, margin: 'auto', padding: 3, textAlign: 'center', marginTop: '40px', boxShadow: 4, borderRadius: '20px' }}>
            <ProgressBar activeStep={currentIndex} />

            <div>
                <Typography variant="h5" component="div" sx={{ marginBottom: 2 }}>
                    {currentQuestion.question}
                </Typography>

                <RadioGroup
                    value={selectedOption}
                    onChange={(event) => handleOptionSelect(event.target.value)}
                    name="options"
                >
                    {currentQuestion.options.map((option, optionIndex) => (
                        <FormControlLabel
                            key={optionIndex}
                            value={option}
                            control={<Radio />}
                            label={option}
                            disabled={submitted}
                            sx={{ marginLeft: '45px' }}
                        />
                    ))}
                </RadioGroup>

                <Button onClick={handleSubmit} disabled={submitted}>
                    Submit
                </Button>

                <Button onClick={handleNext} disabled={!submitted || currentIndex === questions.length - 1}>
                    Next
                </Button>

                {submitted && (
                    <div style={{ marginTop: '20px' }}>
                        {selectedOption === currentQuestion.correct_answer ? (
                            <div style={{ color: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 40, marginRight: '10px' }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Correct!
                                </Typography>
                            </div>
                        ) : (
                            <div style={{ color: 'red', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CancelIcon sx={{ fontSize: 40, marginRight: '10px' }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Incorrect. The correct answer is: {currentQuestion.correct_answer}
                                </Typography>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Paper>
    );
};

export default QuizTaker;
