const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "please provide course title"],
        minLength: [4, "Title minmium characters should be 4"],
        maxLength: [80, "Title  maximum characters should be 80 "],
    },
    description: {
        type: String,
        required: [true, "please provide course title"],
        minLength: [20, "Title minmium characters should be 20"]
    },
    lectures: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        video: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true
            }
        },
    }],
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    views: {
        type: Number,
        default: 0
    },
    numOfVideos: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: [true, "Course creator name "]
    },
}, { timestamps: true })


const courseModel = new mongoose.model("Courses", schema);

module.exports = courseModel;