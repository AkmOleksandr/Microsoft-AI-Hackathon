import { useState } from "react"
import TopicSelector from "./TopicSelector";
import QuizTaker from "./QuizTaker";

const Quiz = ({ notes }) => {

    const [questions, setQuestions] = useState(null);

    const generateQuiz = async (noteData) => {
        console.log(noteData);
        try {
            // const response = await fetch("http://127.0.0.1:5000/generate-new-exam", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify(noteData)
            // });
            // if (response.ok) {
            //     const data = await response.json();
            //     console.log(data);
            //     setQuestions(data.generated_questions)
            // }
            setQuestions([
                {
                    "correct_answer": "As the way of life practiced by a group",
                    "options": [
                        "As a set of beliefs and values",
                        "As a geographical location",
                        "As a political system",
                        "As the way of life practiced by a group - Correct"
                    ],
                    "question": "According to the notes, what is the simplest way to understand culture?"
                },
                {
                    "correct_answer": "The impact of globalization on culture",
                    "options": [
                        "The importance of education",
                        "The value of children in society",
                        "The role of technology in modern culture",
                        "The impact of globalization on culture - Correct"
                    ],
                    "question": "What is the main focus of Second Thoughts Essay 3?"
                },
                {
                    "correct_answer": "Prepare for a make-up quiz",
                    "options": [
                        "Read Essay 7 of Second Thoughts",
                        "Take a quiz on Essay 3",
                        "Read Essay 3 of Second Thoughts",
                        "Prepare for a make-up quiz - Correct"
                    ],
                    "question": "What is the recommended homework for the next class?"
                },
                {
                    "correct_answer": "Online",
                    "options": [
                        "Lecture-based",
                        "Discussion-based",
                        "Hands-on",
                        "Online - Correct"
                    ],
                    "question": "What type of class is described in the notes?"
                },
                {
                    "correct_answer": "The impact of culture on society",
                    "options": [
                        "The importance of staying on topic",
                        "The value of group work",
                        "The conversational nature of the class",
                        "The impact of culture on society - Correct"
                    ],
                    "question": "What is the main takeaway from the discussions in class?"
                }
            ])
        } catch (error) {
            console.log("Error generating quiz ", error);
        }
    }

    return  (
        <div>
            {!questions ? (
                <TopicSelector notes={notes} generateQuiz={generateQuiz} />
            ) : (
                <QuizTaker questions={questions} />
            )}
        </div>
    )
}

export default Quiz