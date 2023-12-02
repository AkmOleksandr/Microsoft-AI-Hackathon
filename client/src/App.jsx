import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react"
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Main from "./components/Main";

function App() {
	const [user, setUser] = useState(null);

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginForm setUser={setUser}/>} />
				<Route path="/signup" element={<SignupForm />} />
				<Route path="/" element={user ? <Main /> : <Navigate to="/login" />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App