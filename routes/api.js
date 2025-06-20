const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Review = require('../models/review');

console.log('🚀 API routes loaded successfully!');

// Middleware to ensure JSON responses
router.use((req, res, next) => {
    console.log(`📡 API Request: ${req.method} ${req.path}`);
    res.setHeader('Content-Type', 'application/json');
    next();
});

// GET /api/campgrounds - Get all campgrounds with optional filtering
router.get('/campgrounds', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            location, 
            minPrice, 
            maxPrice,
            sortBy = 'title',
            sortOrder = 'asc'
        } = req.query;

        // Build query object
        const query = {};
        
        // Add search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Add location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Add price filters
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const campgrounds = await Campground.find(query)
            .populate('author', 'username')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Campground.countDocuments(query);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: {
                campgrounds,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCampgrounds: total,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campgrounds',
            message: error.message
        });
    }
});

// GET /api/campgrounds/:id - Get specific campground details
router.get('/campgrounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const campground = await Campground.findById(id)
            .populate('author', 'username email')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author',
                    select: 'username'
                },
                options: { sort: { createdAt: -1 } }
            });

        if (!campground) {
            return res.status(404).json({
                success: false,
                error: 'Campground not found'
            });
        }

        // Calculate average rating
        const avgRating = campground.reviews.length > 0 
            ? campground.reviews.reduce((sum, review) => sum + review.rating, 0) / campground.reviews.length
            : 0;

        res.json({
            success: true,
            data: {
                campground,
                stats: {
                    averageRating: Math.round(avgRating * 10) / 10,
                    totalReviews: campground.reviews.length,
                    createdAt: campground.createdAt || 'N/A'
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch campground',
            message: error.message
        });
    }
});

// GET /api/campgrounds/search/:term - Search campgrounds
router.get('/campgrounds/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const { limit = 10 } = req.query;

        const campgrounds = await Campground.find({
            $or: [
                { title: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { location: { $regex: term, $options: 'i' } }
            ]
        })
        .populate('author', 'username')
        .limit(parseInt(limit))
        .select('title location price images description');

        res.json({
            success: true,
            data: {
                searchTerm: term,
                results: campgrounds.length,
                campgrounds
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: error.message
        });
    }
});

// GET /api/campgrounds/category/:type - Get campgrounds by category
router.get('/campgrounds/category/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { limit = 20 } = req.query;

        // Define category keywords
        const categoryKeywords = {
            ocean: ['ocean', 'sea', 'bay', 'beach', 'coast', 'bayshore'],
            mountain: ['mountain', 'peak', 'summit', 'alpine', 'ridge'],
            desert: ['desert', 'sand', 'dune', 'mesa', 'canyon'],
            river: ['river', 'creek', 'stream', 'rapids', 'waterfall', 'creekside'],
            lake: ['lake', 'pond', 'reservoir', 'lagoon'],
            forest: ['forest', 'woods', 'trees', 'woodland']
        };

        const keywords = categoryKeywords[type.toLowerCase()];
        if (!keywords) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category type',
                validTypes: Object.keys(categoryKeywords)
            });
        }

        const regex = new RegExp(keywords.join('|'), 'i');
        const campgrounds = await Campground.find({
            title: regex
        })
        .populate('author', 'username')
        .limit(parseInt(limit))
        .select('title location price images description');

        res.json({
            success: true,
            data: {
                category: type,
                results: campgrounds.length,
                campgrounds
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category campgrounds',
            message: error.message
        });
    }
});

// GET /api/stats - Get general statistics
router.get('/stats', async (req, res) => {
    try {
        const totalCampgrounds = await Campground.countDocuments();
        const totalReviews = await Review.countDocuments();
        
        // Get price statistics
        const priceStats = await Campground.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        // Get campgrounds by location (top 10)
        const locationStats = await Campground.aggregate([
            {
                $group: {
                    _id: '$location',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                totalCampgrounds,
                totalReviews,
                pricing: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
                topLocations: locationStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

module.exports = router; 