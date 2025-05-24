const express = require("express");
const router = express.Router();
const mangroveController = require("../controllers/mangroveController");

router.post("/mangrove/:email", mangroveController.addData);
router.get("/mangrove/:email", mangroveController.getData);
router.get("/mangrove/coins/:email", mangroveController.getCoins);
router.delete("/mangrove/:email", mangroveController.deleteData);

module.exports = router;