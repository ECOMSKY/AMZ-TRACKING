const Product = require('../models/Product');
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

exports.getAllProducts = async (req, res) => {
    try {
        if(req.user.role === "admin") {
            const products = await Product.find().sort('rank');
            return res.json(products);
        } else {
            const products = await Product.find({userId : req.user.id}).sort('rank');
            return res.json(products);
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = [
    upload.single('productImage'),
    async (req, res) => {
        try {
            const productData = req.body;
            console.log('Received product data:', productData);

            const requiredFields = ['asin', 'brand', 'name', 'score', 'rank', 'marketplace'];
            for (const field of requiredFields) {
                if (!productData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            if (req.file) {
                productData.imageUrl = `/images/products/${req.file.filename}`;
            }

            // Définir le type de produit par défaut à 'multi' si non spécifié
            productData.productType = productData.productType || 'multi';

            // Conversion des champs numériques
            productData.score = Number(productData.score);
            productData.rank = Number(productData.rank);
            if (productData.price) {
                productData.price = Number(productData.price);
            }

            // Gestion des champs spécifiques au type de produit
            if (productData.productType === 'mono') {
                if (!productData.price) {
                    throw new Error('Price is required for mono products');
                }
                if (!productData.currency) {
                    throw new Error('Currency is required for mono products');
                }
            } else {
                // Pour les produits multi, on peut définir des valeurs par défaut
                productData.price = productData.price || 0;
                productData.currency = productData.currency || 'USD';
            }

            const product = new Product(productData);
            const newProduct = await product.save();
            console.log('Saved product:', newProduct);
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(400).json({ message: error.message });
        }
    }
];

exports.getProductInfo = async (req, res) => {
    try {
        const { asin } = req.params;
        const product = await Product.findOne({ asin });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({
            marketplace: product.marketplace,
            affiliateTag: product.affiliateTag
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = [
    upload.single('productImage'),
    async (req, res) => {
        try {
            const productData = req.body;
            if (req.file) {
                productData.imageUrl = `/images/products/${req.file.filename}`;
            }
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};

exports.getActiveProducts = async (req, res) => {
    try {
        let products = await Product.find({ isActive: true }).sort('rank');
        console.log('Active products before sorting:', products);
        const Rule = require('../models/Rule');
        const activeRules = await Rule.find({ isActive: true, action: { $in: ['sort_ascending', 'sort_descending'] } });
        
        activeRules.forEach(rule => {
            products.sort((a, b) => {
                const aValue = a[rule.sortParameter] || 0;
                const bValue = b[rule.sortParameter] || 0;
                return rule.action === 'sort_ascending' ? aValue - bValue : bValue - aValue;
            });
        });
        console.log('Active products after sorting:', products);
        res.json(products);
    } catch (error) {
        console.error("Error in getActiveProducts:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.toggleActivation = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.isActive },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};