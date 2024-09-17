const mongoose = require('mongoose');

const ClickStatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // assuming your users collection is named 'User'
        required: true
    },
    asin: String,
    marketplace: String,
    gclid: String,
    timestamp: Date,
    converted: Boolean,
    revenue: Number,
    funnelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Funnel' }
});

module.exports = mongoose.model('ClickStat', ClickStatSchema);