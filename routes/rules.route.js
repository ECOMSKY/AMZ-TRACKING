const express = require("express");
const router = express.Router();
const rulesController = require("../controllers/rulesController");
const auth = require("../middleware/auth");

router.get("/", auth.UserMiddleware, rulesController.getAllRules);
router.post("/", auth.UserMiddleware, rulesController.createRule);
router.put("/:id", auth.UserMiddleware, rulesController.updateRule);
router.delete("/:id", auth.UserMiddleware, rulesController.deleteRule);
router.post("/:id/toggle", auth.UserMiddleware, rulesController.toggleRule);

module.exports = router;
