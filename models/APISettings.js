const mongoose = require('mongoose');

const APISettingsSchema = new mongoose.Schema({
    amazonAccessKey: String,
    amazonSecretKey: String,
    googleAdsClientId: String,
    googleAdsClientSecret: String,
    googleAdsDeveloperToken: String,
    googleAdsRefreshToken: String
});

module.exports = mongoose.model('APISettings', APISettingsSchema);