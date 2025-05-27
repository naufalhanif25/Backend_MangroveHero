const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/user/market/:email", userController.buyItems);
router.get("/user/market/:email", userController.getItems);
router.post("/user/:email", userController.addUser);
router.get("/user/:email", userController.getUser);

module.exports = router;