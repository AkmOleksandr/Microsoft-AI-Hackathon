import { useState } from "react";

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
        <div>
            {currentQuestion ? (
                <>
                    <h3>{currentQuestion.question}</h3>
                    <ul>
                        {currentQuestion.options.map((option, index) => (
                            <div key={index}>
                                <input
                                    type="radio"
                                    id={`option-${index}`}
                                    name="options"
                                    value={option}
                                    checked={selectedOption === option}
                                    onChange={() => handleOptionSelect(option)}
                                />
                                <label htmlFor={`option-${index}`}>{option}</label>
                            </div>
                        ))}
                    </ul>
                    <button onClick={handleSubmit} disabled={submitted}>
                        Submit
                    </button>
                    <button onClick={handleNext} disabled={!submitted}>
                        Next
                    </button>
                    {submitted && (
                        <div>
                            {selectedOption === currentQuestion.correct_answer ? (
                                <p>Correct!</p>
                            ) : (
                                <p>
                                    Incorrect. The correct answer is: {currentQuestion.correct_answer}
                                </p>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default QuizTaker;
