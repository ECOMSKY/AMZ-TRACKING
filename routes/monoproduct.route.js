const express = require("express");
const router = express.Router();
const monoProductController = require("../controllers/monoProductController");
const auth = require("../middleware/auth");

// Mono Product routes
router.get("/", auth.UserMiddleware, monoProductController.getAllMonoProducts);
router.post("/", auth.UserMiddleware, monoProductController.createMonoProduct);
router.get("/:id", auth.UserMiddleware, monoProductController.getMonoProduct);
router.put("/:id", auth.UserMiddleware, monoProductController.updateMonoProduct);
router.delete("/:id", auth.UserMiddleware, monoProductController.deleteMonoProduct);

module.exports = router;
