const mongoose = require('mongoose');

const TrackingSettingsSchema = new mongoose.Schema({
    googleTagManager: String,
    googleAdsId: String,
    googleAdsConversionLabel: String
  });

module.exports = mongoose.model('TrackingSettings', TrackingSettingsSchema);