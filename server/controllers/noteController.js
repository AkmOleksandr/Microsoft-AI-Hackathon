const Note = require('../models/Note');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function upload_pdf_note(req, res) {
    try {
        const file = req.file;

        const formData = new FormData();
        formData.append('file', file.buffer, { filename: file.originalname });

        const response = await axios.post('http://127.0.0.1:5000/pdf-to-image', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        const img_url_data = { "image_url": response.data.image_urls };

        const text_res = await axios.post('http://127.0.0.1:5000/image-to-text', img_url_data, {
            headers: {
              'Content-Type': 'application/json',
            },
        });

        const text = { "text": text_res.data.extracted_text };

        const summary_res = await axios.post('http://127.0.0.1:5000/summarize', text, {
            headers: {
              'Content-Type': 'application/json',
            },
        });

        const newNote = new Note(summary_res.data.title, response.data.image_urls, summary_res.data.summary);
        await newNote.save();
        
        res.json({ message: 'New note created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// async function get_note(req, res) {

// }

module.exports = {
    upload_pdf_note,
    // get_note,
};