const express = require("express");

const registerController = require("../controllers/registerController");
const loginController = require("../controllers/loginController");
const verifyEmail = require("../controllers/emailVerifyController");
const profileController = require("../controllers/profileController");
const messageController = require("../controllers/messageController");
const peopleController = require("../controllers/peopleController");

const router = express.Router();

// Auth routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/:id/verify/:token", verifyEmail);

// Profile routes
router.get("/profile", profileController.profileController);
router.put("/profile/update", profileController.profileUpdate);

// Messaging
router.get("/messages/:userId", messageController);

// People list
router.get("/people", peopleController);

module.exports = router;
