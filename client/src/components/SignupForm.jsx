import { useState } from "react"

const SignupForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const baseURL = 'http://localhost:3000/auth'

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        const apiUrl = `${baseURL}/signup`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": username, "password": password})
            });
            console.log(response)
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
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
                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default SignupForm