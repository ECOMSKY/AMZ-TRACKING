const TrackingSettings = require('../models/TrackingSettings');
const Funnel = require('../models/Funnel');

exports.getTrackingSettings = async (req, res) => {
    try {
        const funnelId = req.params.funnelId;
        let settings;

        if (funnelId) {
            const funnel = await Funnel.findById(funnelId);
            if (!funnel) {
                return res.status(404).json({ message: 'Funnel not found' });
            }
            settings = {
                googleTagManager: funnel.googleTagManager || '',
                googleAdsId: funnel.googleAdsId || '',
                googleAdsConversionLabel: funnel.googleAdsConversionLabel || '',
                amazonAffiliateTag: funnel.amazonAffiliateTag || ''  // Nouvelle ligne
            };
        } else {
            settings = await TrackingSettings.findOne();
            if (!settings) {
                settings = new TrackingSettings({
                    googleTagManager: '',
                    googleAdsId: '',
                    googleAdsConversionLabel: '',
                    amazonAffiliateTag: process.env.AMAZON_AFFILIATE_TAG || ''  // Utilisation du tag global par défaut
                });
                await settings.save();
            }
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error in getTrackingSettings:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.saveTrackingSettings = async (req, res) => {
    try {
        const funnelId = req.params.funnelId;
        const { googleTagManager, googleAdsId, googleAdsConversionLabel, amazonAffiliateTag } = req.body;

        if (funnelId) {
            const funnel = await Funnel.findByIdAndUpdate(funnelId, {
                googleTagManager,
                googleAdsId,
                googleAdsConversionLabel,
                amazonAffiliateTag  // Nouvelle ligne
            }, { new: true });

            if (!funnel) {
                return res.status(404).json({ message: 'Funnel not found' });
            }
            res.json(funnel);
        } else {
            let settings = await TrackingSettings.findOne();
            if (settings) {
                settings.googleTagManager = googleTagManager;
                settings.googleAdsId = googleAdsId;
                settings.googleAdsConversionLabel = googleAdsConversionLabel;
                settings.amazonAffiliateTag = amazonAffiliateTag;  // Nouvelle ligne
            } else {
                settings = new TrackingSettings(req.body);
            }
            await settings.save();
            res.json(settings);
        }
    } catch (error) {
        console.error('Error in saveTrackingSettings:', error);
        res.status(400).json({ message: error.message });
    }
};