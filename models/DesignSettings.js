const mongoose = require('mongoose');

const DesignSettingsSchema = new mongoose.Schema({
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel',
        required: true,
        unique: true
    },
    logoType: String,
    logoText: String,
    logoImage: String,
    headerColor: String,
    footerColor: String,
    logoFooterColor: String,
    footerText: String
});

module.exports = mongoose.model('DesignSettings', DesignSettingsSchema);