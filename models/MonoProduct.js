const mongoose = require('mongoose');

const MonoProductSchema = new mongoose.Schema({
    asin: { type: String, required: true },
    marketplace: { type: String, required: true },
    logoText: String,
    imageUrl: String,
    productTitle: { type: String, required: true },
    price: { type: Number, required: true },
    affiliateTag: { type: String, default: process.env.AFFILIATE_TAG },
    currency: { type: String, required: true },
    reviews: Number,
    bulletPoints: [String],
    description: { type: String, required: true },
    characteristics: [{
        name: String,
        value: String
    }],
    ctaText: { type: String, required: true },
    ctaBgColor: String,
    ctaTextColor: String
});

MonoProductSchema.index({ asin: 1 }, { unique: false });

module.exports = mongoose.model('MonoProduct', MonoProductSchema);