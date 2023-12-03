import { useState } from "react";
import Homepage from "./components/Homepage";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";


function App() {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	const baseURL = 'http://localhost:3000/auth'

	const handleLogin = async ({ username, password }) => {
		const apiUrl = `${baseURL}/login`;

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json'
				},
				body: JSON.stringify({ "username": username, "password": password })
			});
			if (response.ok) {
				const data = await response.json();
				const { username } = data;
				console.log("SUCCESS ", username);
				setUser(username);
				navigate('/')
			}
		} catch (error) {
			console.error('Fetch error:', error);
		}
	}

	const handleLogout = () => {
		setUser(null);
	}

	return (
		<Routes>
			<Route path="*" element={user ? <Homepage handleLogout={handleLogout} user={user} /> : <Navigate to="/login" replace />} />
			<Route path="/login" element={<Login handleLogin={handleLogin}/>} />
			<Route path="/signup" element={<Signup />} />
		</Routes>
	);
}

export default App;
