const ClickStat = require('../models/ClickStat');
const { Parser } = require('json2csv');

exports.trackClick = async (req, res) => {
    try {
        const { asin, timestamp, gclid, marketplace, funnelId,userId } = req.body;
        console.log('Received click data:', { asin, timestamp, gclid, marketplace, funnelId });
        
        // Vérifiez si le funnelId est fourni
        if (!funnelId) {
            return res.status(400).json({ message: "funnelId is required" });
        }

        const clickStat = new ClickStat({
            userId : userId,
            asin,
            timestamp: new Date(timestamp),
            gclid: gclid || 'N/A',
            marketplace,
            funnelId, // Ajout du funnelId
            converted: false,
            revenue: 0
        });
        
        const savedClick = await clickStat.save();
        console.log('Click saved:', savedClick);
        res.status(201).json(savedClick);
    } catch (error) {
        console.error('Error tracking click:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getClickStats = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        console.log('Fetching click stats for:', { startDate, endDate, page, limit });
        let query = {}
        if(req.user.role === "admin") {
            query =   {
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            };
        } else {
            query = {
                userId : req.user.id,
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            };
        }
      

        const [clicks, totalClicks] = await Promise.all([
            ClickStat.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ClickStat.find({ userId : req.user.id}).countDocuments()
        ]);

        // console.log('Click stats count:', clicks.length);
        // console.log('Total clicks:', totalClicks);

        res.json({
            clicks,
            totalClicks,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalClicks / limit)
        });
    } catch (error) {
        console.error('Error retrieving click stats:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getClickStatsByAsin = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if(req.user.role === "admin") {
            query = {
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        } else {
            query = {
                $or: [
                    { userId: req.user.id },
                ],
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        }

        const isStats = await ClickStat.find(query);
        const [stats, totalItems] = await Promise.all([
            ClickStat.aggregate([
                { $match: query },
                { $group: {
                    _id: '$asin',
                    clicks: { $sum: 1 },
                    conversions: { $sum: { $cond: ['$converted', 1, 0] } },
                    revenue: { $sum: '$revenue' }
                }},
                { $project: {
                    asin: '$_id',
                    clicks: 1,
                    conversions: 1,
                    revenue: 1,
                    _id: 0
                }},
                { $sort: { clicks: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]),
            ClickStat.aggregate([
                { $match: query },
                { $group: { _id: '$asin' } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            stats,
            totalItems: totalItems[0] ? totalItems[0].count : 0,
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalItems[0] ? totalItems[0].count : 0) / limit)
        });
    } catch (error) {
        console.error('Error retrieving ASIN stats:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getClickSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if(req.user.role === "admin") {
            query = {
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        } else {
            query = {
                $or: [
                    { userId: req.user.id },
                ],
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        }
        const summary = await ClickStat.find(query);
        // console.log('After $match stage:', ISsummary);

        // const summary = await ClickStat.aggregate([
        //     { $match: query },
        //     {
        //         $group: {
        //             _id: null,
        //             totalClicks: { $sum: 1 },
        //             totalConversions: { $sum: { $cond: ['$converted', 1, 0] } },
        //             totalRevenue: { $sum: '$revenue' }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             totalClicks: 1,
        //             totalConversions: 1,
        //             totalRevenue: 1
        //         }
        //     }
        // ]);
        if(summary) {
            return res.json({ 
                totalClicks: summary.length,
                totalConversions: summary.filter((el)=>el.converted === true).length,
                totalRevenue: summary
                .filter(el => el.converted === true) // Filter for converted clicks
                .reduce((acc, el) => acc + el.revenue, 0) // Sum the revenue
            })
        } else {
            return res.json({ totalClicks: 0, totalConversions: 0, totalRevenue: 0 });
        }
        
    } catch (error) {
        console.error('Error retrieving click summary:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getDailyStats = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if(req.user.role === "admin") {
            query = {
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        } else {
            query = {
                $or: [
                    { userId: req.user.id },
                ],
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        }
        await ClickStat.find(query);
        const [stats, totalItems] = await Promise.all([
            ClickStat.aggregate([
                { $match: query },
                { $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$timestamp",
                            timezone: "UTC"
                        }
                    },
                    clicks: { $sum: 1 },
                    conversions: { $sum: { $cond: ["$converted", 1, 0] } },
                    revenue: { $sum: "$revenue" }
                }},
                { $project: {
                    date: '$_id',
                    clicks: 1,
                    conversions: 1,
                    revenue: 1,
                    _id: 0
                }},
                { $sort: { date: 1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]),
            ClickStat.aggregate([
                { $match: query },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            stats,
            totalItems: totalItems[0] ? totalItems[0].count : 0,
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalItems[0] ? totalItems[0].count : 0) / limit)
        });
    } catch (error) {
        console.error('Error retrieving daily stats:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.exportCSV = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const clickStats = await ClickStat.find({
            timestamp: { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        }).sort({ timestamp: -1 });

        const fields = ['asin', 'timestamp', 'gclid', 'marketplace', 'converted', 'revenue'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(clickStats);

        res.header('Content-Type', 'text/csv');
        res.attachment('dashboard_data.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getFunnelsStats = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if(req.user.role === "admin") {
            query = {
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        } else {
            query = {
                $or: [
                    { userId: req.user.id },
                ],
                timestamp: { 
                    $gte: new Date(startDate), 
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            }
        }
        await ClickStat.find(query);
        const [stats, totalItems] = await Promise.all([
            ClickStat.aggregate([
                { $match: query },
                { $lookup: {
                    from: 'funnels',
                    localField: 'funnelId',
                    foreignField: '_id',
                    as: 'funnel'
                }},
                { $unwind: '$funnel' },
                { $group: {
                    _id: '$funnelId',
                    name: { $first: '$funnel.name' },
                    templateType: { $first: '$funnel.templateType' },
                    clicks: { $sum: 1 },
                    conversions: { $sum: { $cond: ['$converted', 1, 0] } },
                    revenue: { $sum: '$revenue' }
                }},
                { $sort: { clicks: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]),
            ClickStat.aggregate([
                { $match: query },
                { $group: { _id: '$funnelId' } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            stats,
            totalItems: totalItems[0] ? totalItems[0].count : 0,
            currentPage: parseInt(page),
            totalPages: Math.ceil((totalItems[0] ? totalItems[0].count : 0) / limit)
        });
    } catch (error) {
        console.error('Error retrieving funnels stats:', error);
        res.status(500).json({ message: error.message });
    }
};