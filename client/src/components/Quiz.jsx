import { useState } from "react"
import TopicSelector from "./TopicSelector";
import QuizTaker from "./QuizTaker";
import QuizResults from "./QuizResults";

const Quiz = ({ notes }) => {

    const [questions, setQuestions] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleGenerateAnotherQuiz = () => {
        setQuestions(null);
        setCurrentIndex(0);
        setScore(0);
    };

    const generateQuiz = async (noteData) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/generate-new-exam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noteData)
            });
            if (response.ok) {
                const data = await response.json();
                setQuestions(data.generated_questions)
            }
        } catch (error) {
            console.log("Error generating quiz ", error);
        }
    }

    return  (
        <div>
            {questions === null ? (
                <TopicSelector notes={notes} generateQuiz={generateQuiz} />
            ) : currentIndex >= questions.length ? (
                <QuizResults score={score} handleGenerateAnotherQuiz={handleGenerateAnotherQuiz} />
            ) : (
                <QuizTaker
                    questions={questions}
                    currentIndex={currentIndex}
                    onNavigateNext={handleNext}
                    setScore={setScore}
                />
            )}
        </div>
    )
}

export default Quiz