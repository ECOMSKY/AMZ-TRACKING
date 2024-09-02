const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

const customer = client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
});

exports.reportConversion = async (gclid, conversionValue) => {
    try {
        const response = await customer.conversionUploads.upload({
            conversions: [{
                gclid: gclid,
                conversion_action: process.env.GOOGLE_ADS_CONVERSION_ACTION_ID,
                conversion_value: conversionValue,
                conversion_date_time: new Date().toISOString(),
                conversion_custom_variable: {
                    conversion_custom_variable: process.env.GOOGLE_ADS_CONVERSION_LABEL
                }
            }]
        });
        return response;
    } catch (error) {
        console.error('Error reporting conversion to Google Ads:', error);
        throw error;
    }
};

exports.reportConversions = async (conversions) => {
    for (const conversion of conversions) {
        try {
            await this.reportConversion(conversion.gclid, conversion.conversionValue);
            console.log(`Reported conversion for GCLID ${conversion.gclid}`);
        } catch (error) {
            console.error(`Error reporting conversion for GCLID ${conversion.gclid}:`, error);
        }
    }
};