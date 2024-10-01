const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/user.route");
const ruleRoutes = require("./routes/rules.route");
const funnelRoutes = require("./routes/funnel.route");
const monoProductRoutes = require("./routes/monoproduct.route");
const clickStatsRoutes = require("./routes/clickstat.route");
const productRoutes = require("./routes/product.route");
const settingRoutes = require("./routes/settings.route");
const amazonRoutes = require("./routes/amazon.route");

// Login Sign up
router.use("/user", userRoutes);
// rules
router.use("/rules", ruleRoutes);
// funnels
router.use("/funnels", funnelRoutes);
// mono products
router.use("/mono-products", monoProductRoutes);
// stats
router.use("/stats", clickStatsRoutes);
// product
router.use("/products", productRoutes);
// setting
router.use("/settings", settingRoutes);
// amazon
router.use("/amazon", amazonRoutes);

module.exports = router;
