const express = require("express");
const router = express.Router();
const mangroveController = require("../controllers/mangroveController");

router.post("/add/:email", mangroveController.addData);
router.get("/get/:email", mangroveController.getData);

module.exports = router;