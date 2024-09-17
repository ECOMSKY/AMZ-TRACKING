const mongoose = require('mongoose');

const APISettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // assuming your users collection is named 'User'
        required: true
    },
    amazonAccessKey: String,
    amazonSecretKey: String,
    googleAdsClientId: String,
    googleAdsClientSecret: String,
    googleAdsDeveloperToken: String,
    googleAdsRefreshToken: String
});

module.exports = mongoose.model('APISettings', APISettingsSchema);