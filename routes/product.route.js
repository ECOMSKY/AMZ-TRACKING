const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");

// Product routes
router.get("/", auth.UserMiddleware, productController.getAllProducts);
router.post("/", auth.UserMiddleware, productController.createProduct);
router.get("/product-info/:asin", auth.UserMiddleware, productController.getProductInfo);
router.put("/:id", auth.UserMiddleware, productController.updateProduct);
router.delete("/:id", auth.UserMiddleware, productController.deleteProduct);
router.get("/:id", auth.UserMiddleware, productController.getProductById);
router.put("/:id/toggle-activation", auth.UserMiddleware, productController.toggleActivation);
router.get("/active-products", productController.getActiveProducts);

module.exports = router;
