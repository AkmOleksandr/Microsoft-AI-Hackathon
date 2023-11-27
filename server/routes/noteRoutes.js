const express = require('express');
const noteController = require('../controllers/noteController');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), noteController.upload_pdf_note);
router.get('/:title', noteController.get_note);

module.exports = router;
