require('dotenv').config()
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARYAPI_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Gemini API integration for intelligent image curation
const generateImageCurationStrategy = async (campgroundType, location) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As an expert camping photographer, suggest 3 specific types of high-quality camping images for a ${campgroundType} campground located in ${location}. For each image type, provide:

1. Main subject/scene description
2. Specific visual elements to include
3. Time of day/lighting preference
4. Camera angle/composition style

Focus on images that would make campers excited to visit this specific type of location. Be specific about camping elements (tents, campfires, outdoor activities) that should be visible.

Format as JSON:
{
  "images": [
    {
      "type": "primary_scene",
      "description": "specific description",
      "elements": ["element1", "element2"],
      "lighting": "time/mood",
      "composition": "angle/style"
    }
  ]
}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text.trim();
        
        // Try to parse JSON from response
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.log('Could not parse JSON, using fallback');
        }

        // Fallback structured response
        return generateFallbackImageStrategy(campgroundType);
        
    } catch (error) {
        console.log(`Gemini API unavailable for ${campgroundType}, using fallback strategy`);
        return generateFallbackImageStrategy(campgroundType);
    }
}

// Fallback image strategy when Gemini API is unavailable
const generateFallbackImageStrategy = (campgroundType) => {
    const strategies = {
        ocean: {
            images: [
                {
                    type: "beachfront_camping",
                    description: "Tent setup on sandy beach with ocean view",
                    elements: ["camping tent", "ocean waves", "sandy beach", "sunset"],
                    lighting: "golden hour sunset",
                    composition: "wide angle showing tent and ocean"
                },
                {
                    type: "coastal_campfire",
                    description: "Campfire scene with ocean in background",
                    elements: ["campfire", "people around fire", "ocean view", "evening sky"],
                    lighting: "twilight blue hour",
                    composition: "medium shot focusing on fire with ocean backdrop"
                },
                {
                    type: "beach_activities",
                    description: "Camping gear and beach activities setup",
                    elements: ["camping chairs", "beach gear", "coastal scenery", "outdoor cooking"],
                    lighting: "bright daylight",
                    composition: "lifestyle shot showing camp setup"
                }
            ]
        },
        mountain: {
            images: [
                {
                    type: "alpine_campsite",
                    description: "Tent pitched with mountain peaks in background",
                    elements: ["mountain tent", "alpine peaks", "hiking gear", "pristine nature"],
                    lighting: "morning light on peaks",
                    composition: "dramatic angle showcasing mountain scale"
                },
                {
                    type: "mountain_campfire",
                    description: "Evening campfire with mountain silhouettes",
                    elements: ["stone fire ring", "mountain silhouettes", "starry sky", "warm glow"],
                    lighting: "evening twilight",
                    composition: "low angle showing fire against mountain backdrop"
                },
                {
                    type: "hiking_basecamp",
                    description: "Well-organized mountain camping setup",
                    elements: ["hiking backpacks", "mountain views", "camping table", "outdoor gear"],
                    lighting: "clear mountain daylight",
                    composition: "organized camp layout with scenic backdrop"
                }
            ]
        },
        forest: {
            images: [
                {
                    type: "woodland_campsite",
                    description: "Tent among tall trees with dappled sunlight",
                    elements: ["forest tent", "tall trees", "natural lighting", "forest floor"],
                    lighting: "filtered forest sunlight",
                    composition: "intimate forest setting with natural framing"
                },
                {
                    type: "forest_campfire",
                    description: "Cozy campfire surrounded by woods",
                    elements: ["wood campfire", "forest setting", "camping chairs", "peaceful atmosphere"],
                    lighting: "warm evening glow",
                    composition: "close-up of fire with forest backdrop"
                },
                {
                    type: "nature_exploration",
                    description: "Forest camping with nature activities",
                    elements: ["nature observation", "forest trails", "camping setup", "wildlife spotting"],
                    lighting: "natural forest light",
                    composition: "adventure-focused camping scene"
                }
            ]
        },
        river: {
            images: [
                {
                    type: "riverside_camping",
                    description: "Campsite beside flowing river",
                    elements: ["flowing water", "riverbank tent", "fishing gear", "natural sounds"],
                    lighting: "early morning mist",
                    composition: "tent positioned near water with river flow visible"
                },
                {
                    type: "water_activities",
                    description: "Camping with water recreation focus",
                    elements: ["kayaks", "fishing equipment", "water access", "recreational setup"],
                    lighting: "bright outdoor daylight",
                    composition: "active water recreation scene"
                },
                {
                    type: "peaceful_waterside",
                    description: "Tranquil camping by gentle waters",
                    elements: ["calm water", "reflection", "peaceful setting", "comfortable seating"],
                    lighting: "soft natural light",
                    composition: "serene waterside relaxation"
                }
            ]
        },
        desert: {
            images: [
                {
                    type: "desert_sunrise",
                    description: "Desert camping with dramatic sunrise",
                    elements: ["desert tent", "cacti", "rock formations", "vast sky"],
                    lighting: "golden desert sunrise",
                    composition: "wide vista showing desert scale and beauty"
                },
                {
                    type: "stargazing_camp",
                    description: "Desert camping setup for astronomy",
                    elements: ["clear dark skies", "minimal light pollution", "telescope", "desert landscape"],
                    lighting: "night sky with stars",
                    composition: "camp setup under spectacular starry sky"
                },
                {
                    type: "desert_exploration",
                    description: "Desert adventure camping base",
                    elements: ["hiking gear", "desert plants", "exploration equipment", "sun protection"],
                    lighting: "clear desert daylight",
                    composition: "adventure-ready desert camp"
                }
            ]
        },
        lake: {
            images: [
                {
                    type: "lakeside_serenity",
                    description: "Peaceful camping by calm lake waters",
                    elements: ["lake reflection", "still water", "waterfront tent", "morning calm"],
                    lighting: "peaceful morning light",
                    composition: "tent with perfect lake reflection"
                },
                {
                    type: "lake_recreation",
                    description: "Active lake camping with water sports",
                    elements: ["swimming area", "boat access", "water activities", "family camping"],
                    lighting: "bright summer daylight",
                    composition: "fun family lake camping scene"
                },
                {
                    type: "sunset_lake",
                    description: "Romantic lake camping at sunset",
                    elements: ["sunset colors", "calm lake", "intimate setting", "evening atmosphere"],
                    lighting: "golden sunset over water",
                    composition: "romantic lakeside evening scene"
                }
            ]
        }
    };

    return strategies[campgroundType] || strategies.forest; // Default to forest if type not found
}

// Cloudinary image search and selection
const findCloudinaryImages = async (imageStrategy, campgroundType) => {
    try {
        // Search for existing images in Cloudinary that match our criteria
        const searchResult = await cloudinary.search
            .expression(`folder:yelpcamp/${campgroundType}`)
            .sort_by([['created_at', 'desc']])
            .max_results(30)
            .execute();

        if (searchResult.resources && searchResult.resources.length >= 3) {
            // Randomly select 3 images from available ones
            const shuffled = searchResult.resources.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 3).map(img => ({
                url: img.secure_url,
                filename: img.public_id
            }));
        } else {
            // Fallback to existing images if specific folder doesn't exist
            console.log(`No images found for ${campgroundType}, using fallback images`);
            return getFallbackImages();
        }
    } catch (error) {
        console.log(`Cloudinary search error for ${campgroundType}:`, error.message);
        return getFallbackImages();
    }
}

// Fallback to existing Cloudinary images
const getFallbackImages = () => {
    return [
        {
            url: 'https://res.cloudinary.com/david-codes/image/upload/v1637951098/YelpCamp/s6orfepxjgryqnpdno6k.jpg',
            filename: 'YelpCamp/s6orfepxjgryqnpdno6k'
        },
        {
            url: 'https://res.cloudinary.com/david-codes/image/upload/v1637951098/YelpCamp/pho4iieov1pi2ryt1e75.jpg',
            filename: 'YelpCamp/pho4iieov1pi2ryt1e75'
        },
        {
            url: 'https://res.cloudinary.com/david-codes/image/upload/v1637951099/YelpCamp/xevt3hvbaxzgoq29nqvb.jpg',
            filename: 'YelpCamp/xevt3hvbaxzgoq29nqvb'
        }
    ];
}

// Generate comprehensive image curation report
const generateImageCurationReport = async () => {
    console.log('🎨 Generating AI-Powered Image Curation Strategy...\n');
    
    const campgroundTypes = ['ocean', 'mountain', 'forest', 'river', 'desert', 'lake'];
    const report = {
        strategies: {},
        cloudinaryStatus: {},
        recommendations: []
    };

    for (const type of campgroundTypes) {
        console.log(`📋 Analyzing ${type} campgrounds...`);
        
        // Get Gemini AI strategy
        const strategy = await generateImageCurationStrategy(type, 'various locations');
        report.strategies[type] = strategy;
        
        // Check Cloudinary availability
        const images = await findCloudinaryImages(strategy, type);
        report.cloudinaryStatus[type] = {
            available: images.length,
            images: images
        };
        
        console.log(`   ✅ Strategy generated for ${type}`);
        console.log(`   📁 Found ${images.length} images in Cloudinary`);
        
        // Small delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate recommendations
    report.recommendations = [
        "Upload images to Cloudinary in organized folders: /yelpcamp/ocean/, /yelpcamp/mountain/, etc.",
        "Aim for 15-20 high-quality images per campground type",
        "Focus on images that show camping gear, activities, and natural beauty",
        "Ensure images have good lighting and showcase the unique aspects of each environment",
        "Consider seasonal variations for mountain and forest campgrounds"
    ];

    return report;
}

// Export functions for use in seeding
module.exports = {
    generateImageCurationStrategy,
    findCloudinaryImages,
    generateImageCurationReport,
    getFallbackImages
};

// Run report if called directly
if (require.main === module) {
    generateImageCurationReport().then(report => {
        console.log('\n🎯 AI Image Curation Report Generated!');
        console.log('\n📊 Summary:');
        Object.keys(report.strategies).forEach(type => {
            const strategy = report.strategies[type];
            const available = report.cloudinaryStatus[type].available;
            console.log(`   ${type}: ${strategy.images?.length || 3} strategy types, ${available} images available`);
        });
        
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });
        
        console.log('\n✨ Ready to integrate with seeding script!');
    }).catch(console.error);
} 