const mongoose = require('mongoose');

const TrackingSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // assuming your users collection is named 'User'
    required: true
},
    googleTagManager: String,
    googleAdsId: String,
    googleAdsConversionLabel: String
  });

module.exports = mongoose.model('TrackingSettings', TrackingSettingsSchema);