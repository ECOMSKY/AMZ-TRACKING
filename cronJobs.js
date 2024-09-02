const cron = require('node-cron');
const ClickStat = require('./models/ClickStat');
const AmazonAPI = require('./services/amazonAPI');
const GoogleAdsAPI = require('./services/googleAdsAPI');
const SyncSettings = require('./models/SyncSettings');
const syncController = require('./controllers/syncController');
const Rule = require('./models/Rule');
const Product = require('./models/Product');

async function syncConversions() {
    console.log('Starting conversion sync...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const clicks = await ClickStat.find({ timestamp: { $gte: oneHourAgo }, converted: false });

    if (clicks.length === 0) {
        console.log('No new clicks to check for conversions');
        return;
    }

    for (const click of clicks) {
        try {
            const amazonConversion = await AmazonAPI.checkConversion(click.timestamp, click.asin);
            if (amazonConversion) {
                click.converted = true;
                click.revenue = amazonConversion.revenue;
                await click.save();

                await GoogleAdsAPI.reportConversion(click.gclid, click.revenue);
                console.log(`Conversion synced for ASIN: ${click.asin}, GCLID: ${click.gclid}`);
            }
        } catch (error) {
            console.error(`Error syncing conversion for ASIN: ${click.asin}`, error);
        }
    }
    console.log('Conversion sync completed');
}

async function setupSyncCronJob() {
    try {
        const settings = await SyncSettings.findOne();
        if (settings && settings.syncInterval) {
            cron.schedule(`0 */${settings.syncInterval} * * *`, async () => {
                console.log('Running automatic sync...');
                await syncController.syncConversions();
            });
            console.log(`Sync cron job set up to run every ${settings.syncInterval} hour(s)`);
        } else {
            console.log('No sync interval set, automatic sync disabled');
        }
    } catch (error) {
        console.error('Error setting up sync cron job:', error);
    }
}


async function applyRules() {
    const activeRules = await Rule.find({ isActive: true });
    const products = await Product.find();

    for (const product of products) {
        for (const rule of activeRules) {
            if (evaluateConditions(product, rule.conditions)) {
                applyAction(product, rule.action, rule.rankingValue);
            }
        }
        await product.save();
    }
}

function evaluateConditions(product, conditions) {
    return conditions.every(condition => {
        const value = product[condition.parameter];
        switch (condition.operator) {
            case '<': return value < condition.value1;
            case '>': return value > condition.value1;
            case '=': return value == condition.value1;
            case 'between': return value >= condition.value1 && value <= condition.value2;
        }
    });
}

function applyAction(product, action, rankingValue) {
    switch (action) {
        case 'disable':
            product.isActive = false;
            break;
        case 'increase_ranking':
            product.rank -= rankingValue; // Assuming lower rank number is better
            break;
        case 'decrease_ranking':
            product.rank += rankingValue;
            break;
    }
}

// Exécute la tâche toutes les heures
cron.schedule('0 * * * *', syncConversions);

module.exports = { syncConversions, setupSyncCronJob, applyRules };