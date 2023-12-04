const Note = require('../models/Note');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function upload_note(req, res) {
    try {
        const file = req.file;

        const formData = new FormData();
        formData.append('file', file.buffer, { filename: file.originalname });

        const response = await axios.post('http://127.0.0.1:5000/process-file', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const img_url_data = { "image_url": response.data.image_url };

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

        const newNote = new Note(summary_res.data.title, response.data.image_url, summary_res.data.summary);
        await newNote.save();
        
        res.json({ message: 'New note created' }).status(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function get_note(req, res) {
    try {
        const title = req.params.title;
        
        const note = await Note.findByTitle(title);

        res.status(200).json({ title: note.title, url: note.url, summary: note.summary});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function get_all_notes(req, res) {
    try {
        const notes = await Note.findAll();

        res.status(200).json({ notes: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    upload_note,
    get_note,
    get_all_notes
};