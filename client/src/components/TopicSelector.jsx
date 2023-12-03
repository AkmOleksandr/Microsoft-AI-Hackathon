import { useState } from "react"

const TopicSelector = ({ notes, generateQuiz }) => {

    const [topic, setTopic] = useState("");

    const handleGenerate = (e) => {
        e.preventDefault();
        const selectedNote = notes.find((note) => note.title == topic);
        const { title, summary } = selectedNote;
        const noteData = {title, summary};
        generateQuiz(noteData)
    }

    return (
        <form onSubmit={handleGenerate}>
            <label>
                Choose a topic:
                <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="">Select</option>
                {notes.map((note, index) => (
                    <option key={index} value={note.title}>
                        {note.title}
                    </option>
                ))}
                </select>
            </label>
            <button type="submit" disabled={!topic}>
                Generate Quiz
            </button>
        </form>
    )
}

export default TopicSelector