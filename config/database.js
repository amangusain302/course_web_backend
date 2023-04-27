const mongoose = require('mongoose');
exports.connectDB = async() => {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongoDB connected with ${connection.host}`)
}