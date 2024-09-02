const MonoProduct = require('../models/MonoProduct');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

exports.getAllMonoProducts = async (req, res) => {
    try {
        console.log('Fetching all mono products');
        const monoProducts = await MonoProduct.find();
        console.log(`Found ${monoProducts.length} mono products`);
        res.json(monoProducts);
    } catch (error) {
        console.error('Error fetching mono products:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createMonoProduct = [
    upload.single('productImage'),
    async (req, res) => {
        console.log('Received mono product data:', req.body);
        try {
            const productData = {
                asin: req.body.asin,
                marketplace: req.body.marketplace,
                logoText: req.body['logo-text'],
                productTitle: req.body['product-title'],
                price: parseFloat(req.body.price),
                currency: req.body.currency,
                affiliateTag: req.body.affiliateTag || process.env.AFFILIATE_TAG,
                reviews: parseInt(req.body.reviews),
                bulletPoints: Array.isArray(req.body.bulletPoints) 
                    ? req.body.bulletPoints.filter(bp => bp.trim() !== '')
                    : req.body.bulletPoints ? [req.body.bulletPoints] : [],
                description: req.body.description,
                characteristics: Array.isArray(req.body['characteristic-names[]']) 
          ? req.body['characteristic-names[]'].map((name, index) => ({
              name: name,
              value: Array.isArray(req.body['characteristic-values[]']) 
                ? req.body['characteristic-values[]'][index] 
                : req.body['characteristic-values[]']
            }))
          : req.body['characteristic-names[]'] 
            ? [{ 
                name: req.body['characteristic-names[]'], 
                value: req.body['characteristic-values[]'] 
              }]
            : [],
                ctaText: req.body['cta-text'],
                ctaBgColor: req.body['cta-bg-color'],
                ctaTextColor: req.body['cta-text-color']
            };

            if (req.file) {
                productData.imageUrl = `/images/products/${req.file.filename}`;
            }

            console.log('Attempting to save product:', productData);
            const product = new MonoProduct(productData);
            const savedProduct = await product.save();
            res.status(201).json(savedProduct);
        } catch (error) {
            console.error('Error saving mono product:', error);
            res.status(400).json({ message: error.message });
        }
    }
];

exports.getMonoProduct = async (req, res) => {
    try {
        const product = await MonoProduct.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateMonoProduct = [
    upload.single('productImage'),
    async (req, res) => {
        try {
            console.log('Received update data:', req.body);

            const productData = {
                asin: req.body.asin,
                marketplace: req.body.marketplace,
                logoText: req.body.logoText,
                productTitle: req.body.productTitle,
                price: parseFloat(req.body.price),
                currency: req.body.currency,
                reviews: parseInt(req.body.reviews),
                bulletPoints: Array.isArray(req.body.bulletPoints) 
                    ? req.body.bulletPoints.filter(bp => bp.trim() !== '')
                    : req.body.bulletPoints ? [req.body.bulletPoints] : [],
                description: req.body.description,
                characteristics: Array.isArray(req.body['characteristic-names[]']) 
                    ? req.body['characteristic-names[]'].map((name, index) => ({
                        name: name,
                        value: Array.isArray(req.body['characteristic-values[]']) 
                            ? req.body['characteristic-values[]'][index] 
                            : req.body['characteristic-values[]']
                    }))
                    : req.body['characteristic-names[]'] 
                        ? [{ 
                            name: req.body['characteristic-names[]'], 
                            value: req.body['characteristic-values[]'] 
                        }]
                        : [],
                ctaText: req.body.ctaText,
                ctaBgColor: req.body.ctaBgColor,
                ctaTextColor: req.body.ctaTextColor
            };

            if (req.file) {
                productData.imageUrl = `/images/products/${req.file.filename}`;
            }

            const updatedProduct = await MonoProduct.findByIdAndUpdate(req.params.id, productData, { new: true });

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }

            console.log('Updated product:', updatedProduct);
            res.json(updatedProduct);
        } catch (error) {
            console.error('Error updating mono product:', error);
            res.status(400).json({ message: error.message });
        }
    }
];

exports.deleteMonoProduct = async (req, res) => {
    try {
        await MonoProduct.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateAmazonUrl = async (req, res) => {
    try {
        const { asin, marketplace, gclid, timestamp } = req.body;
        const affiliateTag = process.env.AFFILIATE_TAG;

        const marketplaceUrls = {
            'US': 'https://www.amazon.com',
            'UK': 'https://www.amazon.co.uk',
            'FR': 'https://www.amazon.fr',
            'DE': 'https://www.amazon.de',
            // Ajoutez d'autres marketplaces si nécessaire
        };

        const baseUrl = marketplaceUrls[marketplace] || marketplaceUrls['US'];
        const url = new URL(`${baseUrl}/dp/${asin}`);
        url.searchParams.append('tag', affiliateTag);
        url.searchParams.append('timestamp', timestamp);
        if (gclid) {
            url.searchParams.append('gclid', gclid);
        }

        res.json({ url: url.toString() });
    } catch (error) {
        console.error('Error generating Amazon URL:', error);
        res.status(500).json({ message: 'Error generating Amazon URL' });
    }
};