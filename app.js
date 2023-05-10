const express = require('express');
const { config } = require('dotenv');
const { connectDB } = require('./config/database');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary');
const razorpay = require('razorpay');
const app = express();
config({
    path: "./config/config.env"
});

exports.instance = new razorpay({
    key_id: process.env.RAZORPAY_API_ID,
    key_secret: process.env.RAZORPAY_API_SECRET
})

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET
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
const payment = require('./routes/paymentRoute');

app.use('/api/v1', course);
app.use('/api/v1', user);
app.use('/api/v1', payment);






app.use(ErrorMiddleware);
connectDB();
const port = process.env.PORT;


app.listen(port, () => {
    console.log(`server is working on port ${port}`)
})