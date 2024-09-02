const Rule = require('../models/Rule');
const Product = require('../models/Product');
const ClickStat = require('../models/ClickStat'); // Assurez-vous que ce modèle existe
const Funnel = require('../models/Funnel');

exports.getAllRules = async (req, res) => {
    try {
        const rules = await Rule.find().populate('funnelId', 'name').sort('name');
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRule = async (req, res) => {
    try {
        const ruleData = req.body;
        // Vérification supplémentaire pour le funnelId si nécessaire
        if (ruleData.funnelId) {
            const funnel = await Funnel.findById(ruleData.funnelId);
            if (!funnel) {
                return res.status(400).json({ message: 'Funnel not found' });
            }
        }
        const rule = new Rule(ruleData);
        const newRule = await rule.save();
        console.log("New rule created:", newRule);
        
        if (newRule.applyImmediately) {
            await exports.applyRulesToExistingProducts(newRule);
        }
        
        res.status(201).json(newRule);
    } catch (error) {
        console.error("Error in createRule:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const updatedRule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedRule.applyImmediately) {
            await exports.applyRulesToExistingProducts(updatedRule);
        }
        res.json(updatedRule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteRule = async (req, res) => {
    try {
        await Rule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleRule = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        rule.isActive = !rule.isActive;
        await rule.save();
        res.json(rule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.applyRulesToExistingProducts = async (rule) => {
    let products;
    if (rule.funnelId) {
        const funnel = await Funnel.findById(rule.funnelId).populate('products');
        products = funnel ? funnel.products : [];
    } else {
        products = await Product.find();
    }

    for (const product of products) {
        const clickStats = await ClickStat.findOne({ asin: product.asin }).sort('-timestamp');
        if (clickStats && await evaluateRule(clickStats, rule)) {
            await applyRuleToProduct(product, rule);
        }
    }
    console.log(`Rule ${rule.name} applied to products${rule.funnelId ? ' in specified funnel' : ''}`);
};

exports.removeRuleEffects = async (rule) => {
    const products = await Product.find();
    for (const product of products) {
        // Reset product properties based on rule action
        if (rule.action === 'disable') {
            product.isActive = true;
        } else if (rule.action === 'increase_ranking' || rule.action === 'decrease_ranking') {
            // You might want to implement a more sophisticated way to reset ranking
            product.rank = product.originalRank || product.rank;
        }
        await product.save();
    }
};

async function evaluateRule(product, rule) {
    const clickStats = await ClickStat.findOne({ asin: product.asin }).sort('-timestamp');
    if (!clickStats) return false;

    return rule.conditions.every(condition => {
        const statsValue = clickStats[condition.parameter];
        switch (condition.operator) {
            case '>': return statsValue > condition.value1;
            case '<': return statsValue < condition.value1;
            case '=': return statsValue == condition.value1;
            case 'between': return statsValue >= condition.value1 && statsValue <= condition.value2;
            default: return false;
        }
    });
}

async function applyRuleToProduct(product, rule) {
    switch (rule.action) {
        case 'disable':
            product.isActive = false;
            break;
        case 'increase_ranking':
            product.rank = Math.max(1, product.rank - rule.rankingValue);
            break;
        case 'decrease_ranking':
            product.rank += rule.rankingValue;
            break;
        case 'sort_ascending':
        case 'sort_descending':
            // Sorting will be handled separately
            break;
    }
    await product.save();
    console.log(`Rule ${rule.action} applied to product ${product.asin}`);
}


function getProductValue(product, parameter) {
    // This function should return the latest value for the given parameter
    // You might need to fetch this from your ClickStat model
    return product[parameter] || 0;
}