const mongoose = require("mongoose");

const Mangrove = new mongoose.Schema(
    {
        coordinate: { 
            type: [Number], 
            required: true 
        },
        email: { 
            type: String, 
            required: true 
        },
        status: {
            type: String,
            enum: ["Bibit", "Muda", "Dewasa", "Tua"],
            required: true,
            default: "Bibit",
        },
        health: {
            type: Number,
            required: true,
            default: 100,
        },
        coins: {
            type: Number,
            required: true,
            default: 0,
        },
        lastCoinGenerated: {
            type: Date,
            default: Date.now,
        },
        lastFertilized: {
            type: Date,
            default: Date.now,
        },
        plantedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Mangrove", Mangrove);