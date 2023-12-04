const QuizResults = ({ score, handleGenerateAnotherQuiz }) => {
    return (
        <div>
            <p>Your Score: {score}</p>
            <button onClick={handleGenerateAnotherQuiz}>Generate Another Quiz</button>
        </div>
    )
}

export default QuizResults