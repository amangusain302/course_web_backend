const express = require('express');
const { config } = require('dotenv');
const { connectDB } = require('./config/database');
const cookieParser = require('cookie-parser');
const app = express();
config({
    path: "./config/config.env"
});

//using middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}))
app.use(cookieParser());
const { ErrorMiddleware } = require('./middlewares/Error');
const course = require('./routes/courseRoute');
const user = require('./routes/userRoute');

app.use('/api/v1', course);
app.use('/api/v1', user);






app.use(ErrorMiddleware);
connectDB();
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server is working on port ${port}`)
})