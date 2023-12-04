import { useState } from "react"
import TopicSelector from "./TopicSelector";
import QuizTaker from "./QuizTaker";
import QuizResults from "./QuizResults";

const Quiz = ({ notes }) => {

    const [questions, setQuestions] = useState([
        {
            "correct_answer": "Both a client and a server",
            "options": [
                "Dedicated server",
                "Client only",
                "Server only",
                "Both a client and a server"
            ],
            "question": "In a P2P network, each host acts as a:"
        },
        {
            "correct_answer": "Structured networks have a way to find files, while unstructured networks do not",
            "options": [
                "Unstructured networks have a central authority, while structured networks do not",
                "Structured networks have a central authority, while unstructured networks do not",
                "Unstructured networks have a way to find files, while structured networks do not",
                "Structured networks have a way to find files, while unstructured networks do not"
            ],
            "question": "What is the main difference between unstructured and structured P2P networks?"
        },
        {
            "correct_answer": "All of the above",
            "options": [
                "To keep track of the files in the network",
                "To store redundant information in case a node leaves the system",
                "To find peers in the network",
                "All of the above"
            ],
            "question": "What is a Distributed Hash Table used for in a P2P system?"
        },
        {
            "correct_answer": "The tracker and DHT do not co-exist",
            "options": [
                "The tracker is used to find peers, while the DHT is used to keep track of files",
                "The tracker is used to keep track of files, while the DHT is used to find peers",
                "The tracker and DHT are used for the same purpose",
                "The tracker and DHT do not co-exist"
            ],
            "question": "How does a traditional tracker co-exist with a Distributed Hash Table in a P2P system?"
        },
        {
            "correct_answer": "It varies depending on the network",
            "options": [
                "Unstructured P2P",
                "Structured P2P",
                "A combination of both",
                "It varies depending on the network"
            ],
            "question": "What is the model favored by most P2P networks?"
        }
    ]);
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
            ) : currentIndex == questions.length - 1 ? (
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