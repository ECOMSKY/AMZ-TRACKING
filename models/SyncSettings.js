const mongoose = require('mongoose');

const SyncSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // assuming your users collection is named 'User'
        required: true
    },
    syncInterval: Number,
    lastSyncTime: Date
});

module.exports = mongoose.model('SyncSettings', SyncSettingsSchema);