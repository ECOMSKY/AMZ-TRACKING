const APISettings = require('../models/APISettings');

exports.getAPISettings = async (req, res) => {
    try {
        let settings = await APISettings.findOne();
        if (!settings) {
            settings = new APISettings({
                amazonAccessKey: '',
                amazonSecretKey: '',
                googleAdsClientId: '',
                googleAdsClientSecret: '',
                googleAdsDeveloperToken: ''
            });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error in getAPISettings:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.saveAPISettings = async (req, res) => {
    try {
        let settings = await APISettings.findOne();
        if (settings) {
            Object.assign(settings, req.body);
        } else {
            settings = new APISettings(req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        console.error('Error in saveAPISettings:', error);
        res.status(400).json({ message: error.message });
    }
};