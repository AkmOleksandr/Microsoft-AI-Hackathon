import Navbar from "./Navbar"
import { Route, Routes } from "react-router-dom"
import Notes from "./Notes"
import Quiz from "./Quiz"

const Homepage = ({ handleLogout, user }) => {
    return (
        <div>
            <Navbar handleLogout={handleLogout} user={user} />
            <div>
                <Routes>
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/quizzes" element={<Quiz />} />
                </Routes>
            </div>
        </div>
    )
}

export default Homepage