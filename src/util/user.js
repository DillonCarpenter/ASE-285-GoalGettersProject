const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique:true}, // To prevent confusion, no two users can have the same username
    password: {type: String, required: true},
    time_created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("user",userSchema);