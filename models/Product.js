const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // assuming your users collection is named 'User'
        required: true
    },
    asin: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    imageUrl: String,
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    marketplace: { type: String, required: true },
    buttonText: { type: String, default: "View on Amazon" },
    buttonColor: { type: String, default: "#8ac832" },
    isActive: { type: Boolean, default: true },
    productType: {
        type: String,
        enum: ['mono', 'multi'],
        default: 'multi'
    },
    price: { type: Number, required: function() { return this.productType === 'mono'; } },
    currency: { 
        type: String, 
        enum: ['USD', 'EUR', 'GBP'],
        required: function() { return this.productType === 'mono'; }
    },
    isInFunnel: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', ProductSchema);