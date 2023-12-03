import {
	Typography,
	Grid,
	Card,
	CardContent,
	Modal,
} from "@mui/material";
import { useState } from "react";


const Note = ({ title, url, summary }) => {
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Grid item xs={12} sm={6} md={4}>
			<Card style={{ marginBottom: "10px", cursor: "pointer" }} onClick={handleOpen}>
				<CardContent>
					<Typography variant="h6" component="div">
						{title}
					</Typography>
					<img src={url} alt={title} style={{ maxWidth: "100%", maxHeight: "150px", marginTop: "10px" }} />
					<Typography variant="body2" color="text.secondary" style={{ marginTop: "10px", maxHeight: "100px", overflow: "hidden" }}>
						{summary}
					</Typography>
				</CardContent>
			</Card>
			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={open}
				onClose={handleClose}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div style={{ backgroundColor: "#fff", padding: "20px", maxWidth: "80%", overflowY: "auto" }}>
					<Typography variant="h6" gutterBottom>
						{title}
					</Typography>
					<a href={url} target="_blank" rel="noopener noreferrer">
						View Image
					</a>
					<Typography variant="body2" color="text.secondary">
						{summary}
					</Typography>
				</div>
			</Modal>
		</Grid>
	);
};

export default Note