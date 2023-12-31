import { Route, Routes } from "react-router-dom"
import { useEffect, useState } from "react"
import Notes from "./Notes"
import Quiz from "./Quiz"
import Layout from "./Layout"

const Homepage = ({ handleLogout, user }) => {
    const [notes, setNotes] = useState([]);

    const baseURL = 'http://localhost:3000'

    const fetchData = async () => {
        try {
            const response = await fetch(`${baseURL}/note/`);
            if (response.ok) {
                const data = await response.json()
                console.log(data.notes);
                setNotes(data.notes)

                localStorage.setItem('cachedNotes', JSON.stringify(data.notes))
            } else {
                console.log("Failed to fetch notes");
            }
        } catch (error) {
            console.log("Error fetching data", error);
        }
    }

    useEffect (() => {
        const cachedNotes = localStorage.getItem('cachedNotes');
        if (cachedNotes) {
            console.log("already there")
            setNotes(JSON.parse(cachedNotes));
        } else {
            console.log("fetching")
            fetchData();
        }
        console.log("refresh")
    }, []);

    return (
        <Layout handleLogout={handleLogout} user={user}>
            <Routes>
                <Route index element={<Notes fetchData={fetchData} notes={notes} />} />
                <Route path="notes" element={<Notes fetchData={fetchData} notes={notes} />} />
                <Route path="quizzes" element={<Quiz notes={notes}/>} />
            </Routes>            
        </Layout>
    )
};

export default Homepage;