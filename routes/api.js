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
router.get('/clicks', clickStatController.getClickStats);
router.get('/click-summary', clickStatController.getClickSummary);
router.get('/daily-stats', clickStatController.getDailyStats);
router.get('/asin-stats', clickStatController.getClickStatsByAsin);
router.get('/export-csv', clickStatController.exportCSV);
router.get('/funnels-stats', clickStatController.getFunnelsStats);

// Product routes
router.get('/products', productController.getAllProducts);
router.post('/products', productController.createProduct);
router.get('/product-info/:asin', productController.getProductInfo);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id/toggle-activation', productController.toggleActivation);
router.get('/active-products', productController.getActiveProducts);

// Affiliate tag route (à implémenter)
router.get('/affiliate-tag', (req, res) => {
    res.json({ affiliateTag: process.env.AFFILIATE_TAG });
});

// Design
router.post('/design-settings', designController.saveDesignSettings);
router.get('/design-settings/:funnelId', designController.getDesignSettings);

// Tracking
// Dans api.js, ajoutez ces lignes :
router.get('/tracking-settings/:funnelId', trackingController.getTrackingSettings);
router.post('/tracking-settings/:funnelId', trackingController.saveTrackingSettings);

// API
router.get('/api-settings', apiController.getAPISettings);
router.post('/api-settings', apiController.saveAPISettings);

// Sync
router.get('/sync-settings', syncController.getSyncSettings);
router.post('/sync-settings', syncController.saveSyncSettings);
router.post('/sync-conversions', syncController.syncConversions);

// Login Sign up
router.post('/login', userController.login);
router.post('/signup', userController.signup);

// Protected routes
router.get('/user-profile', auth, userController.getUserProfile);
router.post('/update-profile', auth, userController.updateProfile);

// Rules routes
router.get('/rules', rulesController.getAllRules);
router.post('/rules', rulesController.createRule);
router.put('/rules/:id', rulesController.updateRule);
router.delete('/rules/:id', rulesController.deleteRule);
router.post('/rules/:id/toggle', rulesController.toggleRule);

// Funnels
router.get('/funnels', funnelController.getAllFunnels);
router.post('/funnels', funnelController.createFunnel);
router.put('/funnels/:id', funnelController.updateFunnel);
router.delete('/funnels/:id', funnelController.deleteFunnel);
router.get('/funnels/:id/products', funnelController.getFunnelProducts);
router.get('/funnels/:id', funnelController.getFunnel);
router.post('/funnels/:id/products', funnelController.addProductsToFunnel);
router.post('/save-funnel-products', funnelController.saveFunnelProducts);

// Mono Product routes
router.get('/mono-products', monoProductController.getAllMonoProducts);
router.post('/mono-products', monoProductController.createMonoProduct);
router.get('/mono-products/:id', monoProductController.getMonoProduct);
router.put('/mono-products/:id', monoProductController.updateMonoProduct);
router.delete('/mono-products/:id', monoProductController.deleteMonoProduct);

// Amazon URL
router.post('/generate-amazon-url', monoProductController.generateAmazonUrl);

module.exports = router;