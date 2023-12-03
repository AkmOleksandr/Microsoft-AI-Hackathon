import { useState } from "react"
import Note from "./Note";
import { Container, Paper, CircularProgress, Grid } from "@mui/material";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Notes = ({ fetchData, notes }) => {

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const baseURL = 'http://localhost:3000'
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files && event.target.files[0]);
    };

    const uploadFile = async (event) => {
        event.preventDefault();
    
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            setUploading(true);
            const response = await fetch(`${baseURL}/note/upload`, {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                await response.json();
                fetchData();
                setUploading(false);
                setSelectedFile(null);
            } else {
                console.error("Failed to upload file. Status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div>
            <Container sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }} maxWidth="md">
                <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                    <Typography variant="h5" gutterBottom>
                        Upload Form
                    </Typography>
                    <input
                        type="file"
                        accept="pdf/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="upload-input"
                    />
                    <label htmlFor="upload-input">
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                        onClick={handleFileChange}
                    >
                        Upload
                    </Button>
                    </label>
                    {uploading && <CircularProgress style={{ marginLeft: '10px' }} size={20} />}
                    <Typography variant="body2" style={{ marginTop: '10px' }}>
                        {selectedFile && `Selected File: ${selectedFile.name}`}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={uploadFile}
                        style={{ marginTop: '10px' }}
                        disabled={!selectedFile || uploading}
                    >
                        Submit
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            setSelectedFile(null);
                            setUploading(false);
                        }}
                        style={{ marginTop: '10px', marginLeft: '10px' }}
                    >
                        Clear
                    </Button>
                </Paper>
                <Grid marginTop={2} container spacing={2}>
                    {notes.map((note, index) => (
                        <Note key={index} {...note} />
                    ))}
                </Grid>
            </Container>
            
        </div>
        
    )
}

export default Notes