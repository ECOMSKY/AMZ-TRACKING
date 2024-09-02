const mongoose = require('mongoose');

const ClickStatSchema = new mongoose.Schema({
    asin: String,
    marketplace: String,
    gclid: String,
    timestamp: Date,
    converted: Boolean,
    revenue: Number,
    funnelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Funnel' }
});

module.exports = mongoose.model('ClickStat', ClickStatSchema);