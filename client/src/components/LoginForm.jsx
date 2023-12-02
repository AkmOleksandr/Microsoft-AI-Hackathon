import { useState } from "react"

const LoginForm = ( { setUser }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const baseURL = 'http://localhost:3000/auth'

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const apiUrl = `${baseURL}/login`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": username, "password": password})
            });
            if (response.ok) {
                const data = await response.json()
                const { username, token } = data
                localStorage.setItem('token', token);
                setUser(username);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>
                    Username:
                    <input type="text" name="username" onChange={(e) => setUsername(e.target.value)} required />
                </label>
                <br />
                <br />
                <label>
                    Password:
                    <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginForm