const mongoose = require("mongoose");

const user = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    totalCoins: {
        type: Number,
        required: true,
        default: 0,
    },
    items: {
        type: Number,
        enum: [0, 1],
    },
    purchases: {
        type: []
    },
});

module.exports = mongoose.model("User", user);
