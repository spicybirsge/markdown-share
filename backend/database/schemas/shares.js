const mongoose = require("mongoose");

const shares = new mongoose.Schema({
    _id: String,
    title: String,
    description: String,
    content: String,
    createdAt: String,
    views: Array,
    private: Boolean
})

module.exports = mongoose.model("Shares", shares)