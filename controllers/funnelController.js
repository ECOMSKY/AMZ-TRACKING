const Funnel = require('../models/Funnel');
const Product = require('../models/Product');
const MonoProduct = require('../models/MonoProduct');

exports.getAllFunnels = async (req, res) => {
    try {
        const funnels = await Funnel.find();
        res.json(funnels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFunnel = async (req, res) => {
    console.log('Received request to create funnel:', req.body);

    if (req.body.templateType && !req.body.templateType.includes('Product')) {
        req.body.templateType = req.body.templateType.charAt(0).toUpperCase() + req.body.templateType.slice(1) + " Product";
    }

    const funnel = new Funnel({
        ...req.body,
        googleTagManagerId: req.body.googleTagManagerId || '',
        googleAdsId: req.body.googleAdsId || '',
        googleAdsConversionLabel: req.body.googleAdsConversionLabel || ''
    });

    try {
        const newFunnel = await funnel.save();
        console.log('Funnel saved successfully:', newFunnel);
        res.status(201).json(newFunnel);
    } catch (error) {
        console.error('Error creating funnel:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getFunnel = async (req, res) => {
    try {
        const funnel = await Funnel.findById(req.params.id).populate('products');
        if (!funnel) {
            return res.status(404).json({ message: 'Funnel not found' });
        }
        res.json(funnel);
    } catch (error) {
        console.error('Error getting funnel:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateFunnel = async (req, res) => {
    try {
        const updatedFunnel = await Funnel.findByIdAndUpdate(req.params.id, {
            ...req.body,
            googleTagManagerId: req.body.googleTagManagerId || '',
            googleAdsId: req.body.googleAdsId || '',
            googleAdsConversionLabel: req.body.googleAdsConversionLabel || ''
        }, { new: true });
        res.json(updatedFunnel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteFunnel = async (req, res) => {
    try {
        await Funnel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Funnel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFunnelProducts = async (req, res) => {
    try {
        console.log('Getting products for funnel:', req.params.id);
        const funnel = await Funnel.findById(req.params.id);
        if (!funnel) {
            console.log('Funnel not found');
            return res.status(404).json({ message: 'Funnel not found' });
        }
        console.log('Funnel found:', funnel);

        let products;
        if (funnel.templateType === 'Mono Product') {
            products = await MonoProduct.find({ _id: { $in: funnel.products } });
        } else {
            products = await Product.find({ _id: { $in: funnel.products } });
        }

        console.log('Products found:', products);
        res.json(products);
    } catch (error) {
        console.error('Error getting funnel products:', error);
        res.status(500).json({ message: error.message });
    }
};



exports.updateFunnelProducts = async (req, res) => {
    try {
        const funnel = await Funnel.findById(req.params.id);
        if (!funnel) {
            return res.status(404).json({ message: 'Funnel not found' });
        }
        funnel.products = req.body.productIds;
        await funnel.save();
        res.json(funnel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.addProductsToFunnel = async (req, res) => {
    try {
        const funnel = await Funnel.findById(req.params.id);
        if (!funnel) {
            return res.status(404).json({ message: 'Funnel not found' });
        }
        funnel.products = req.body.productIds;
        await funnel.save();

        // Mise à jour des produits
        await Product.updateMany(
            { _id: { $in: req.body.productIds } },
            { $set: { isInFunnel: true } }
        );

        await Product.updateMany(
            { _id: { $nin: req.body.productIds } },
            { $set: { isInFunnel: false } }
        );

        res.json({ message: 'Products added to funnel successfully', funnel });
    } catch (error) {
        console.error('Error adding products to funnel:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.saveFunnelProducts = async (req, res) => {
    try {
        const { selectedProducts } = req.body;
        
        // Mettez à jour les produits sélectionnés (par exemple, marquez-les comme inclus dans le funnel)
        await Product.updateMany(
            { _id: { $in: selectedProducts } },
            { $set: { isInFunnel: true } }
        );

        // Retirez les produits non sélectionnés du funnel
        await Product.updateMany(
            { _id: { $nin: selectedProducts } },
            { $set: { isInFunnel: false } }
        );

        res.json({ message: 'Funnel products saved successfully' });
    } catch (error) {
        console.error('Error saving funnel products:', error);
        res.status(500).json({ message: 'Failed to save funnel products' });
    }
};

exports.renderFunnelLandingPage = async (req, res) => {
    try {
        const funnel = await Funnel.findById(req.params.id).populate('products');
        if (!funnel) {
            return res.status(404).send('Funnel not found');
        }
        res.render('funnel-landing', { funnel });
    } catch (error) {
        console.error('Error rendering funnel landing page:', error);
        res.status(500).send('Server error');
    }
};