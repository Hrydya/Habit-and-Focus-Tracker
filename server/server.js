require('dotenv').config()
const connectdb = require('./config/db.js')
const authroutes = require('./routes/authroutes.js')
const habitroutes = require('./routes/habitroutes.js')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const app = express();
const cors = require('cors')
app.set('trust proxy', 1)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { msg: "Too many requests, please try again after 15 minutes" }
})
const authlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { msg: "Too many requests, please try again after 15 minutes" }
})


app.use(cors())
app.use(helmet())

const port = process.env.PORT || 5000;

app.use(express.json())
app.use('/api/auth', authlimiter, authroutes)
app.use('/api/habits', limiter, habitroutes)
connectdb();

app.get('/', (req, res) => {
    res.send('API is running')
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})
