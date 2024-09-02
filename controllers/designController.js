const DesignSettings = require('../models/DesignSettings');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/logos')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });



exports.getDesignSettings = async (req, res) => {
    try {
        const { funnelId } = req.params;
        let settings = await DesignSettings.findOne({ funnelId });
        if (!settings) {
            settings = new DesignSettings({
                funnelId,
                logoType: 'text',
                logoText: 'Best Electric Guide',
                logoImage: '',
                headerColor: '#000000',
                footerColor: '#000000',
                logoFooterColor: '#ffffff',
                footerText: '© 2024 Best Electric Guide. All rights reserved.'
            });
        }
        console.log('Settings being sent:', settings); // Ajoutez cette ligne
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.saveDesignSettings = [
    upload.single('logoImage'),
    async (req, res) => {
        try {
            let settings = await DesignSettings.findOne({ funnelId: req.params.funnelId });
            if (settings) {
                Object.assign(settings, req.body);
            } else {
                settings = new DesignSettings({ funnelId: req.params.funnelId, ...req.body });
            }

            if (req.file) {
                settings.logoImage = `/images/logos/${req.file.filename}`;
            }

            await settings.save();
            res.json(settings);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];