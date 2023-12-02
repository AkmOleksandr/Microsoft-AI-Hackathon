const express = require('express');
const bodyParser = require('body-parser');
const dbConfig = require('./config/dbConfig');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors())
dbConfig.setupCosmosDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.use('/auth', authRoutes);
app.use('/note', noteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});