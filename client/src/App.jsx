import { useState } from "react";
import Homepage from "./components/Homepage";
import AuthPage from "./components/AuthPage"; // Import the new component

function App() {
	const [user, setUser] = useState(null);

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
				const data = await response.json()
				const { username } = data
				setUser(username);
			}
		} catch (error) {
			console.error('Fetch error:', error);
		}
	}

	const handleLogout = () => {
		setUser(null);
	}

	return (
		user ? <Homepage handleLogout={handleLogout} user={user} /> : <AuthPage handleLogin={handleLogin} />
	);
}

export default App;
