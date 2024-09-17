const mongoose = require('mongoose');

const FunnelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // assuming your users collection is named 'User'
        required: true
    },
    name: { type: String, required: true },
    templateType: { type: String, required: true },
    customDomain: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'productModel' }],
    googleTagManager: String,
    googleAdsId: String,
    googleAdsConversionLabel: String,
    amazonAffiliateTag: String  // Ajout du nouveau champ
});

FunnelSchema.virtual('productModel').get(function() {
    return this.templateType === 'Mono Product' ? 'MonoProduct' : 'Product';
});

FunnelSchema.path('templateType').validate(function(value) {
    return value === 'Multi Product' || value === 'Mono Product';
}, 'templateType must be either "Multi Product" or "Mono Product"');

module.exports = mongoose.model('Funnel', FunnelSchema);