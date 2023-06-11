const express = require('express');
const { config } = require('dotenv');
const { connectDB } = require('./config/database');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary');
const razorpay = require('razorpay');
const NodeCron = require('node-cron');
const cors = require('cors');
const Stats = require("./models/Stats");
const app = express();
config({
    path: "./config/config.env"
});
// app.use(function(req, res, next) {
//     res.header('Content-Type', 'application/json;charset=UTF-8')
//     res.header('Access-Control-Allow-Credentials', true)
//     res.header(
//       'Access-Control-Allow-Headers',
//       'Origin, X-Requested-With, Content-Type, Accept'
//     )
//     next()
//   })
// app.use(session({
//     resave : false,
//     saveUninitialized: false,
//     secret : 'sessionss',
//     cookie:{
//         maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
//         sameSite: "none",
//         httpOnly: false
//     }
// }))
// app.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
//   });
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
app.use(cookieParser());
// || "rzp_test_ATm31E9nqQq1He"
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

const { ErrorMiddleware } = require('./middlewares/Error');
const course = require('./routes/courseRoute');
const user = require('./routes/userRoute');
const payment = require('./routes/paymentRoute');
const other = require('./routes/otherRoute');

app.use('/api/v1', course);
app.use('/api/v1', user);
app.use('/api/v1', payment);
app.use('/api/v1', other);


app.get("/home", (req, res) => {
    res.cookie('token' , "kjsfjsahfashkfasf43434", {
        maxAge: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }).send("<H1 align='center' > WELCOME TO COURSE WEB PLEASE VIST OUR FORNTEND SITE</H1><a href='http://localhost:3000/'>Click</a>")
})


app.get("/", (req, res) => {
    res.send("<H1 align='center' > WELCOME TO COURSE WEB PLEASE VIST OUR FORNTEND SITE</H1><a href='http://localhost:3000/'>Click</a>")
})



app.use(ErrorMiddleware);
connectDB();
const port = process.env.PORT;

NodeCron.schedule("0 0 0 1 * *", async() => {
    console.log("a");
    try {
        await Stats.create({});
    } catch (err) {
        console.log(err)
    }
});


app.listen(port, () => {
    console.log(`server is working on port ${port}`)
})