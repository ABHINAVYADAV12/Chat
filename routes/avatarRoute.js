const express = require("express");
const avatarController = require("../controllers/avatarController");

const router = express.Router();

// Routes
router.post("/", avatarController.createAvatar); // renamed for clarity
router.get("/all", avatarController.getAllAvatars);

module.exports = router;
