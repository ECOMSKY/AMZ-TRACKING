require('dotenv').config();
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const clickStatController = require('../controllers/clickStatController');
const designController = require('../controllers/designController');
const trackingController = require('../controllers/trackingController');
const apiController = require('../controllers/apiController');
const syncController = require('../controllers/syncController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const rulesController = require('../controllers/rulesController');
const funnelController = require('../controllers/funnelController');
const monoProductController = require('../controllers/monoProductController');

// ClickStat routes
router.post('/click', clickStatController.trackClick);
router.get('/clicks',auth.UserMiddleware, clickStatController.getClickStats);
router.get('/click-summary',auth.UserMiddleware, clickStatController.getClickSummary);
router.get('/daily-stats',auth.UserMiddleware, clickStatController.getDailyStats);
router.get('/asin-stats',auth.UserMiddleware, clickStatController.getClickStatsByAsin);
router.get('/export-csv',auth.UserMiddleware, clickStatController.exportCSV);
router.get('/funnels-stats',auth.UserMiddleware, clickStatController.getFunnelsStats);

// Product routes
router.get('/products',auth.UserMiddleware, productController.getAllProducts);
router.post('/products',auth.UserMiddleware, productController.createProduct);
router.get('/product-info/:asin',auth.UserMiddleware, productController.getProductInfo);
router.put('/products/:id',auth.UserMiddleware, productController.updateProduct);
router.delete('/products/:id',auth.UserMiddleware, productController.deleteProduct);
router.get('/products/:id',auth.UserMiddleware, productController.getProductById);
router.put('/products/:id/toggle-activation',auth.UserMiddleware, productController.toggleActivation);
router.get('/active-products', productController.getActiveProducts);

// Affiliate tag route (à implémenter)
router.get('/affiliate-tag', (req, res) => {
    res.json({ affiliateTag: process.env.AFFILIATE_TAG });
});

// Design
router.post('/design-settings',auth.UserMiddleware, designController.saveDesignSettings);
router.get('/design-settings/:funnelId', designController.getDesignSettings);

// Tracking
// Dans api.js, ajoutez ces lignes :
router.get('/tracking-settings/:funnelId', trackingController.getTrackingSettings);
router.post('/tracking-settings/:funnelId',auth.UserMiddleware, trackingController.saveTrackingSettings);

// API
router.get('/api-settings',auth.UserMiddleware, apiController.getAPISettings);
router.post('/api-settings',auth.UserMiddleware, apiController.saveAPISettings);

// Sync
router.get('/sync-settings',auth.UserMiddleware, syncController.getSyncSettings);
router.post('/sync-settings',auth.UserMiddleware, syncController.saveSyncSettings);
router.post('/sync-conversions',auth.UserMiddleware, syncController.syncConversions);

// Login Sign up
router.post('/login', userController.login);
router.post('/signup', userController.signup);

// Protected routes
router.get('/user-profile', auth.UserMiddleware, userController.getUserProfile);
router.post('/update-profile', auth.UserMiddleware, userController.updateProfile);

// Rules routes
router.get('/rules',auth.UserMiddleware, rulesController.getAllRules);
router.post('/rules',auth.UserMiddleware, rulesController.createRule);
router.put('/rules/:id',auth.UserMiddleware, rulesController.updateRule);
router.delete('/rules/:id',auth.UserMiddleware, rulesController.deleteRule);
router.post('/rules/:id/toggle',auth.UserMiddleware, rulesController.toggleRule);

// Funnels
router.get('/funnels',auth.UserMiddleware, funnelController.getAllFunnels);
router.post('/funnels',auth.UserMiddleware, funnelController.createFunnel);
router.put('/funnels/:id',auth.UserMiddleware, funnelController.updateFunnel);
router.delete('/funnels/:id',auth.UserMiddleware, funnelController.deleteFunnel);
router.get('/funnels/:id/products', funnelController.getFunnelProducts);
router.get('/funnels/:id',auth.UserMiddleware, funnelController.getFunnel);
router.post('/funnels/:id/products',auth.UserMiddleware, funnelController.addProductsToFunnel);
router.post('/save-funnel-products',auth.UserMiddleware, funnelController.saveFunnelProducts);

// Mono Product routes
router.get('/mono-products', auth.UserMiddleware,monoProductController.getAllMonoProducts);
router.post('/mono-products',auth.UserMiddleware, monoProductController.createMonoProduct);
router.get('/mono-products/:id',auth.UserMiddleware, monoProductController.getMonoProduct);
router.put('/mono-products/:id',auth.UserMiddleware, monoProductController.updateMonoProduct);
router.delete('/mono-products/:id',auth.UserMiddleware, monoProductController.deleteMonoProduct);

// Amazon URL
router.post('/generate-amazon-url', monoProductController.generateAmazonUrl);

module.exports = router;