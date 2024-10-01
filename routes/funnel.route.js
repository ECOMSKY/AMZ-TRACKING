const express = require("express");
const router = express.Router();
const funnelController = require("../controllers/funnelController");
const auth = require("../middleware/auth");

router.get("/", auth.UserMiddleware, funnelController.getAllFunnels);
router.post("/", auth.UserMiddleware, funnelController.createFunnel);
router.put("/:id", auth.UserMiddleware, funnelController.updateFunnel);
router.delete("/:id", auth.UserMiddleware, funnelController.deleteFunnel);
router.get("/:id/products", funnelController.getFunnelProducts);
router.get("/:id", auth.UserMiddleware, funnelController.getFunnel);
router.post("/:id/products", auth.UserMiddleware, funnelController.addProductsToFunnel);
router.post("/save-funnel-products", auth.UserMiddleware, funnelController.saveFunnelProducts);

module.exports = router;
