import { Route, Routes } from "react-router-dom"
import Notes from "./Notes"
import Quiz from "./Quiz"
import Layout from "./Layout"

const Homepage = ({ handleLogout, user }) => {
    return (
        <Layout handleLogout={handleLogout} user={user}>
            <Routes>
                <Route index element={<Notes />} />
                <Route path="notes" element={<Notes />} />
                <Route path="quizzes" element={<Quiz />} />
            </Routes>            
        </Layout>
    )
};

export default Homepage;