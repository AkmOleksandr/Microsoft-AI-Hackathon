const express = require('express')
const bodyParser = require('body-parser');
const dbConfig = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express()

app.use(bodyParser.json());
dbConfig.setupCosmosDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})