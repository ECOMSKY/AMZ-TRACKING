const amazonPaapi = require('amazon-paapi');

const commonParameters = {
    'AccessKey': process.env.AMAZON_ACCESS_KEY,
    'SecretKey': process.env.AMAZON_SECRET_KEY,
    'PartnerTag': process.env.AFFILIATE_TAG,
    'PartnerType': 'Associates',
    'Marketplace': 'www.amazon.com'
};

exports.getProductInfo = async (asin) => {
    const requestParameters = {
        'ItemIds': [asin],
        'Resources': [
            'Images.Primary.Medium',
            'ItemInfo.Title',
            'Offers.Listings.Price'
        ]
    };

    try {
        const response = await amazonPaapi.GetItems(commonParameters, requestParameters);
        return response.ItemsResult.Items[0];
    } catch (error) {
        console.error('Error fetching product info from Amazon:', error);
        throw error;
    }
};

exports.checkConversions = async (unsyncedClicks) => {
    const conversions = [];
    for (const click of unsyncedClicks) {
        try {
            const product = await this.getProductInfo(click.asin);
            if (product && product.Offers && product.Offers.Listings && product.Offers.Listings[0].Price) {
                conversions.push({
                    gclid: click.gclid,
                    conversionValue: product.Offers.Listings[0].Price.Amount,
                    conversionTime: new Date()
                });
            }
        } catch (error) {
            console.error(`Error checking conversion for ASIN ${click.asin}:`, error);
        }
    }
    return conversions;
};