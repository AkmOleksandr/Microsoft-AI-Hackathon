
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react"
import Login from "./components/Login";
import Signup from "./components/Signup";
import Main from "./components/Main";
import Notes from "./components/Notes";

function App() {
	const [user, setUser] = useState(null);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login setUser={setUser}/>} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/notes" element={<Notes />} />
				<Route path="/" element={user ? <Main /> : <Navigate to="/login" />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App