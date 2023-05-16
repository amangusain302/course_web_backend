const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    users: {
        type: Number,
        default: 0,
        require: true
    },
    subscription: {
        type: Number,
        default: 0,
        require: true
    },
    views: {
        type: Number,
        default: 0,
        require: true
    }
}, { timestamps: true })

const Stats = new mongoose.model("Stats", schema);

module.exports = Stats;