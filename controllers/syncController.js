const SyncSettings = require('../models/SyncSettings');
const ClickStat = require('../models/ClickStat');
const amazonService = require('../services/amazonAPI');
const googleAdsService = require('../services/googleAdsAPI');

exports.getSyncSettings = async (req, res) => {
    try {
        let settings = await SyncSettings.findOne();
        if (!settings) {
            settings = new SyncSettings({ syncInterval: 1 });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error in getSyncSettings:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.saveSyncSettings = async (req, res) => {
    try {
        let settings = await SyncSettings.findOne();
        if (settings) {
            settings.syncInterval = req.body.syncInterval;
        } else {
            settings = new SyncSettings(req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Error in saveSyncSettings:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.syncConversions = async (req, res) => {
    try {
        // Fetch unsynced clicks
        const unsyncedClicks = await getUnsyncedClicks();

        // Check conversions with Amazon
        const conversions = await amazonService.checkConversions(unsyncedClicks);

        // Report conversions to Google Ads
        await googleAdsService.reportConversions(conversions);

        // Update converted clicks in the database
        for (const conversion of conversions) {
            await ClickStat.findOneAndUpdate(
                { gclid: conversion.gclid },
                { converted: true, revenue: conversion.conversionValue }
            );
        }

        // Update last sync time
        await SyncSettings.findOneAndUpdate({}, { lastSyncTime: new Date() }, { upsert: true });

        res.json({ message: 'Sync completed successfully', conversionsCount: conversions.length });
    } catch (error) {
        console.error('Error in syncConversions:', error);
        res.status(500).json({ message: error.message });
    }
};

async function getUnsyncedClicks() {
    return await ClickStat.find({ converted: false });
}