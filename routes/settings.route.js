const express = require("express");
const router = express.Router();
const designController = require("../controllers/designController");
const trackingController = require("../controllers/trackingController");
const apiController = require("../controllers/apiController");
const syncController = require("../controllers/syncController");
const auth = require("../middleware/auth");

// Design
router.post("/design-settings", auth.UserMiddleware, designController.saveDesignSettings);
router.get("/design-settings/:funnelId", designController.getDesignSettings);

// Tracking
// Dans api.js, ajoutez ces lignes :
router.get("/tracking-settings/:funnelId", trackingController.getTrackingSettings);
router.post(
    "/tracking-settings/:funnelId",
    auth.UserMiddleware,
    trackingController.saveTrackingSettings,
);

// API
router.get("/api-settings", auth.UserMiddleware, apiController.getAPISettings);
router.post("/api-settings", auth.UserMiddleware, apiController.saveAPISettings);

// Sync
router.get("/sync-settings", auth.UserMiddleware, syncController.getSyncSettings);
router.post("/sync-settings", auth.UserMiddleware, syncController.saveSyncSettings);
router.post("/sync-conversions", auth.UserMiddleware, syncController.syncConversions);

module.exports = router;
