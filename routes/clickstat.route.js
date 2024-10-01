const express = require("express");
const router = express.Router();
const clickStatController = require("../controllers/clickStatController");
const auth = require("../middleware/auth");

router.post("/click", clickStatController.trackClick);
router.get("/clicks", auth.UserMiddleware, clickStatController.getClickStats);
router.get("/click-summary", auth.UserMiddleware, clickStatController.getClickSummary);
router.get("/daily-stats", auth.UserMiddleware, clickStatController.getDailyStats);
router.get("/asin-stats", auth.UserMiddleware, clickStatController.getClickStatsByAsin);
router.get("/export-csv", auth.UserMiddleware, clickStatController.exportCSV);
router.get("/funnels-stats", auth.UserMiddleware, clickStatController.getFunnelsStats);

module.exports = router;
