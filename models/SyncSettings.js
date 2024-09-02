const mongoose = require('mongoose');

const SyncSettingsSchema = new mongoose.Schema({
    syncInterval: Number,
    lastSyncTime: Date
});

module.exports = mongoose.model('SyncSettings', SyncSettingsSchema);