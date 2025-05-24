if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mangroveRoute = require("./routes/mangroveRoute");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(express.json());

const PORT = 3000;
const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI.toString(), clientOptions);

        console.log("Successfully connect to the MongoDB");
    }
    catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
}

connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(console.dir);

app.use("/api", mangroveRoute);

module.exports = app;
