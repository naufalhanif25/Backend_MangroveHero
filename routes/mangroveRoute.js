const express = require("express");
const router = express.Router();
const mangroveController = require("../controllers/mangroveController");

router.post("/mangrove/:email", mangroveController.addData);
router.get("/mangrove/:email", mangroveController.getData);
router.get("/mangrove/:email/:row/:column", mangroveController.getData);
router.post("/mangrove/fertilizer/:email", mangroveController.addFertilizer);
router.get("/mangrove/coins/:email/:row/:column", mangroveController.getCoins);
router.delete("/mangrove/:email", mangroveController.deleteData);

module.exports = router;