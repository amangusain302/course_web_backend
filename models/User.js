const mongoose = require("mongoose")
const validator = require('validator')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const schema = new mongoose.Schema({
    name: { type: String, required: [true, "Please enter your name"] },
    email: { type: String, required: [true, "Please enter your email"], unique: true, validate: validator.isEmail },
    password: { type: String, required: [true, "Please enter your password"], minLength: [6, 'atleast 6 characters'], select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    subscription: { id: String, status: String },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    playlist: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses"
        },
        poster: String,
    }, ],
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: String
})

schema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

schema.methods.getJWTToken = function() {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
}


schema.methods.comparePassword = async function(password) {
    // console.log(this.password);
    return await bcrypt.compare(password, this.password);
}

schema.methods.getResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

const userModel = new mongoose.model("users", schema);

module.exports = userModel;