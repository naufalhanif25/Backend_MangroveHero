const express = require("express");
const router = express.Router();
const mangroveController = require("../controllers/mangroveController");

router.post("/mangrove/:email", mangroveController.addData);
router.get("/mangrove/:email", mangroveController.getData);
router.get("/mangrove/:email/:row/:column", mangroveController.getData);
router.get("/mangrove/coins/:email/:row/:column", mangroveController.getCoins);
router.delete("/mangrove/:email", mangroveController.deleteData);
router.post("/buyItems/:email", mangroveController.buyItems);
router.get("/items/:email", mangroveController.getItems);

module.exports = router;