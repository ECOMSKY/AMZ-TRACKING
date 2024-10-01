require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const rootRoute = require('./route.index');
const { setupSyncCronJob, applyRules } = require('./cronJobs');
const productController = require('./controllers/productController');
const Funnel = require('./models/Funnel');
const monopPoductController = require('./controllers/monoProductController');
const MonoProduct = require('./models/MonoProduct');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
// logger
const { logger, apiLoggerMiddleware } = require("./logger");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('Connected to MongoDB');
    try {
      await MonoProduct.collection.dropIndex('asin_1');
      logger.info('Index on ASIN dropped successfully');
    } catch (error) {
      logger.info('No index to drop or error occurred:', error);
    }
  })
  .catch(err => logger.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;"
  );
  next();
});

// Custom domain
app.use(async (req, res, next) => {
  const host = req.get('host');
  if (host !== 'your-main-app-domain.com') {
      const funnel = await Funnel.findOne({ customDomain: host });
      if (funnel) {
          // Rediriger vers la landing page du funnel
          return res.redirect(`/funnel/${funnel._id}`);
      }
  }
  next();
});
app.use(apiLoggerMiddleware)

// Routes
app.use('/v1', rootRoute);

// const pages = ['', 'login', 'signup', 'dashboard', 'design', 'products', 'tracking', 'api', 'sync', 'funnels', 'profile', 'monoproducts', 'mono-product'];

// pages.forEach(page => {
//   app.get(`/${page}`, (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', `${page || 'index'}.html`));
//   });
// });

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  // setupSyncCronJob().catch(console.error);
});


// app.get('/rules', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'rules.html'));
// });

// app.get('/mono-product.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'mono-product.html'));
// });

// app.get('/monoproducts', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'monoproducts.html'));
// });