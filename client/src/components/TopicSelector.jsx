import { useState } from "react"
import { Container, Paper, Backdrop, CircularProgress } from "@mui/material";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const TopicSelector = ({ notes, generateQuiz }) => {

    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedNote = notes.find((note) => note.title == topic);
            const { title, summary } = selectedNote;
            const noteData = { title, summary };
            await generateQuiz(noteData)
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }} maxWidth="md">
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h5" gutterBottom>
                    Select a Topic
                </Typography>
                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="demo-multiple-name-label">Topic</InputLabel>
                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-multiple-name"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        input={<OutlinedInput label="Name" />}
                        MenuProps={MenuProps}
                    >
                        {notes.map((note, index) => (
                            <MenuItem
                                key={index}
                                value={note.title}
                            >
                                {note.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerate}
                    style={{ marginTop: '10px' }}
                    disabled={!topic}
                >
                    Generate a Quiz
                </Button>

                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Paper>
        </Container>
    )
}

export default TopicSelector