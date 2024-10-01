const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Login Sign up
router.post("/login", userController.login);
router.post("/signup", userController.signup);

// Protected routes
router.get("/user-profile", auth.UserMiddleware, userController.getUserProfile);
router.post("/update-profile", auth.UserMiddleware, userController.updateProfile);
module.exports = router;
