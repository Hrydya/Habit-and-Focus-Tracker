require('dotenv').config()
const connectdb = require('./config/db.js')
const authroutes = require('./routes/authroutes.js')
const habitroutes = require('./routes/habitroutes.js')
const express = require('express')
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use('/api/auth', authroutes)
app.use('/api/habits',habitroutes)
connectdb();

app.get('/', (req, res) => {
    res.send('API is running')
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})