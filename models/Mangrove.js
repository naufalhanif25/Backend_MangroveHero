const mongoose = require("mongoose");

const Mangrove = mongoose.Schema({
    coordinate: {
        type: [Number],
        require: true,
    },
    email: {
        type: String,
        require: true,
    }
});

module.exports = mongoose.model("Mangrove", Mangrove);