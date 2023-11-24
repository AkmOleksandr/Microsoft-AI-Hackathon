const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.post('/upload', noteController.upload_note);
router.get('/notes/:title', noteController.get_note);

module.exports = router;
