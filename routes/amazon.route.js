require("dotenv").config();
const express = require("express");
const router = express.Router();
const monoProductController = require("../controllers/monoProductController");

// Amazon URL
router.post("/generate-amazon-url", monoProductController.generateAmazonUrl);
router.get("/affiliate-tag", (req, res) => {
    res.json({ affiliateTag: process.env.AFFILIATE_TAG });
});

module.exports = router;
