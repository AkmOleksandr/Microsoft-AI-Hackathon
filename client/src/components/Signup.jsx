import { useState } from "react"
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Link } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import EditNoteIcon from '@mui/icons-material/EditNote';


const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const baseURL = 'http://localhost:3000/auth'

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        const apiUrl = `${baseURL}/signup`;
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"username": username, "password": password})
            });
        
            setUsername("");
            setPassword("");
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <EditNoteIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Make an Account
                </Typography>
                <Box component="form" onSubmit={handleSignUp} noValidate sx={{ mt: 1 }}>
                    <TextField 
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                    <TextField 
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Signup
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link variant="body2" to="/login" style={{ textDecoration: 'none' }}>Already have an account? Sign in</Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}

export default Signup