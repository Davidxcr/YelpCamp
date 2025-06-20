require('dotenv').config()
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
const User = require('../models/user')
const { findCloudinaryImages, generateImageCurationStrategy } = require('../image-curator')

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]

// Enhanced description templates based on campground type and location
const generateUniqueDescription = (campgroundName, location) => {
    const [city, state] = location.split(', ');
    const lowerName = campgroundName.toLowerCase();
    
    // Different templates based on campground type
    const templates = {
        ocean: [
            `Experience coastal bliss at ${campgroundName} near ${city}, ${state}. Wake up to ocean breezes and endless horizons.`,
            `${campgroundName} offers beachfront camping in ${city}, ${state} with pristine shorelines and tide pool exploration.`,
            `Discover maritime adventures at ${campgroundName} in ${city}, ${state}. Perfect for surfing, fishing, and sunset viewing.`
        ],
        mountain: [
            `Nestled in the peaks near ${city}, ${state}, ${campgroundName} provides alpine serenity and hiking trails.`,
            `${campgroundName} sits majestically in ${city}, ${state} offering mountain vistas and crisp, clean air.`,
            `High-altitude camping awaits at ${campgroundName} near ${city}, ${state} with starry nights and scenic overlooks.`
        ],
        forest: [
            `${campgroundName} immerses you in the woodland beauty of ${city}, ${state} with towering trees and wildlife.`,
            `Find forest sanctuary at ${campgroundName} in ${city}, ${state} featuring shaded sites and nature trails.`,
            `Woodland camping at its finest - ${campgroundName} near ${city}, ${state} offers peaceful forest retreats.`
        ],
        river: [
            `${campgroundName} flows alongside pristine waters near ${city}, ${state} perfect for fishing and kayaking.`,
            `Riverside relaxation awaits at ${campgroundName} in ${city}, ${state} with gentle currents and swimming holes.`,
            `Experience waterfront camping at ${campgroundName} near ${city}, ${state} with excellent fishing opportunities.`
        ],
        desert: [
            `${campgroundName} showcases the rugged beauty of ${city}, ${state} with stunning desert landscapes and clear skies.`,
            `Desert camping at ${campgroundName} near ${city}, ${state} offers incredible stargazing and unique geological features.`,
            `Experience the mystique of ${campgroundName} in ${city}, ${state} with expansive desert views and peaceful solitude.`
        ],
        lake: [
            `${campgroundName} sits on the shores of pristine waters near ${city}, ${state} ideal for swimming and boating.`,
            `Lakeside paradise at ${campgroundName} in ${city}, ${state} featuring crystal-clear waters and fishing opportunities.`,
            `${campgroundName} offers waterfront camping near ${city}, ${state} with beautiful lake views and water sports.`
        ],
        default: [
            `${campgroundName} provides an exceptional camping experience in ${city}, ${state} with modern amenities and natural beauty.`,
            `Discover outdoor adventure at ${campgroundName} near ${city}, ${state} featuring scenic landscapes and recreational activities.`,
            `${campgroundName} offers the perfect escape in ${city}, ${state} combining comfort with wilderness adventure.`
        ]
    };
    
    // Determine campground type based on name
    let templateType = 'default';
    if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('bay')) templateType = 'ocean';
    else if (lowerName.includes('mountain') || lowerName.includes('peak') || lowerName.includes('sky')) templateType = 'mountain';
    else if (lowerName.includes('forest') || lowerName.includes('redwood') || lowerName.includes('elk')) templateType = 'forest';
    else if (lowerName.includes('river') || lowerName.includes('creek') || lowerName.includes('cascade')) templateType = 'river';
    else if (lowerName.includes('desert') || lowerName.includes('dusty') || lowerName.includes('ancient')) templateType = 'desert';
    else if (lowerName.includes('lake') || lowerName.includes('pond') || lowerName.includes('bullfrog')) templateType = 'lake';
    
    // Add state-specific features
    const stateFeatures = {
        'California': 'redwood forests and Pacific coastline',
        'Colorado': 'Rocky Mountain peaks and alpine meadows',
        'Florida': 'subtropical wetlands and pristine beaches',
        'Texas': 'wide open spaces and hill country',
        'Washington': 'evergreen forests and mountain vistas',
        'Oregon': 'dramatic coastlines and volcanic landscapes',
        'Montana': 'Big Sky country and wilderness areas',
        'Wyoming': 'geothermal features and wildlife corridors'
    };
    
    let description = sample(templates[templateType]);
    
    // Add state-specific enhancement
    if (stateFeatures[state]) {
        description += ` Explore the region's famous ${stateFeatures[state]}.`;
    }
    
    return description;
}

// Gemini API integration for generating unique descriptions (when properly configured)
const generateCampgroundDescription = async (campgroundName, location) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate a unique, engaging 2-3 sentence description for a campground called "${campgroundName}" located in ${location}. Make it sound inviting and highlight natural features, activities, or unique characteristics that would appeal to outdoor enthusiasts. Keep it under 200 characters and make each description distinctly different.`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.log(`API unavailable, using enhanced fallback for ${campgroundName}`);
        // Use our enhanced description generator as fallback
        return generateUniqueDescription(campgroundName, location);
    }
}

// Dynamic pricing based on location and campground type
const generateDynamicPrice = (location, campgroundName) => {
    let basePrice = 25;
    
    // Premium locations get higher prices
    const premiumStates = ['California', 'Colorado', 'Wyoming', 'Montana', 'Washington', 'Oregon'];
    const state = location.split(', ')[1];
    
    if (premiumStates.includes(state)) {
        basePrice += Math.floor(Math.random() * 20) + 15; // $15-35 extra
    }
    
    // Special campground types get price adjustments
    const lowerName = campgroundName.toLowerCase();
    if (lowerName.includes('luxury') || lowerName.includes('resort')) {
        basePrice += Math.floor(Math.random() * 30) + 20; // $20-50 extra
    } else if (lowerName.includes('basic') || lowerName.includes('primitive') || lowerName.includes('dispersed')) {
        basePrice -= Math.floor(Math.random() * 10) + 5; // $5-15 less
    } else if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('lake')) {
        basePrice += Math.floor(Math.random() * 15) + 10; // Waterfront premium
    } else if (lowerName.includes('mountain') || lowerName.includes('sky')) {
        basePrice += Math.floor(Math.random() * 12) + 8; // Mountain premium  
    }
    
    // Add some randomization
    basePrice += Math.floor(Math.random() * 25) + 5; // $5-30 variation
    
    return Math.max(basePrice, 15); // Minimum $15
}

// Helper function to determine campground type
const determineCampgroundType = (campgroundName) => {
    const lowerName = campgroundName.toLowerCase();
    
    if (lowerName.includes('ocean') || lowerName.includes('sea') || lowerName.includes('bay')) return 'ocean';
    else if (lowerName.includes('mountain') || lowerName.includes('peak') || lowerName.includes('sky')) return 'mountain';
    else if (lowerName.includes('forest') || lowerName.includes('redwood') || lowerName.includes('elk')) return 'forest';
    else if (lowerName.includes('river') || lowerName.includes('creek') || lowerName.includes('cascade')) return 'river';
    else if (lowerName.includes('desert') || lowerName.includes('dusty') || lowerName.includes('ancient')) return 'desert';
    else if (lowerName.includes('lake') || lowerName.includes('pond') || lowerName.includes('bullfrog')) return 'lake';
    
    // Default assignment based on descriptors if no specific type found
    const descriptor = campgroundName.split(' ')[0].toLowerCase();
    if (['sunny', 'golden', 'bright'].includes(descriptor)) return 'desert';
    if (['misty', 'foggy', 'silent'].includes(descriptor)) return 'forest'; 
    if (['roaring', 'hidden', 'ancient'].includes(descriptor)) return 'mountain';
    if (['peaceful', 'serene', 'quiet'].includes(descriptor)) return 'lake';
    if (['rushing', 'whispering', 'bubbling'].includes(descriptor)) return 'river';
    if (['endless', 'vast', 'distant'].includes(descriptor)) return 'ocean';
    
    return 'forest'; // Default fallback
}

// AI-powered image selection for campgrounds
const selectCampgroundImages = async (campgroundName, location) => {
    try {
        // Determine campground type
        const campgroundType = determineCampgroundType(campgroundName);
        
        // Get AI-generated image strategy
        const imageStrategy = await generateImageCurationStrategy(campgroundType, location);
        
        // Find appropriate images from Cloudinary
        const images = await findCloudinaryImages(imageStrategy, campgroundType);
        
        console.log(`   🖼️  Selected ${campgroundType} images for ${campgroundName}`);
        return images;
        
    } catch (error) {
        console.log(`   ⚠️  Image selection error for ${campgroundName}, using fallback`);
        // Fallback to existing images
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
}

const seedDB = async () => {
    const existingUser = await User.findOne();
    if (!existingUser) {
        console.error('No user found, please create a user first');
        process.exit(1);
    }

    await Campground.deleteMany({})
    console.log('🎨 Generating unique campgrounds with AI-powered image curation...');
    console.log('🔄 This process combines Gemini AI descriptions with Cloudinary image selection\n');
    
    for (let i = 0; i < 500; i++) { // Increased to 500 campgrounds
        const random1000 = Math.floor(Math.random() * 1000)
        const location = `${cities[random1000].city}, ${cities[random1000].state}`;
        const title = `${sample(descriptors)} ${sample(places)}`;
        
        console.log(`🏕️  Generating campground ${i + 1}/500: ${title} in ${location}`);
        
        // Generate unique description (tries API first, falls back to enhanced generator)
        const description = await generateCampgroundDescription(title, location);
        
        // Generate dynamic pricing
        const price = generateDynamicPrice(location, title);
        
        // AI-powered image selection
        const images = await selectCampgroundImages(title, location);
        
        const camp = new Campground({
            author: existingUser._id,
            location: location,
            title: title,
            description: description,
            price: price,
            geometry: {
                "type": "Point",
                "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: images
        })
        await camp.save()
        
        // Progress reporting and rate limiting
        if (i % 50 === 0 && i > 0) {
            console.log(`📊 Progress: ${i}/500 campgrounds created (${Math.round(i/500*100)}%)`);
            await new Promise(resolve => setTimeout(resolve, 200)); // Slightly longer delay for API calls
        }
        
        // Small delay for each campground to respect API limits
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('🎉 AI-Powered Campground seeding completed!');
    console.log('✨ 500 unique campgrounds with intelligent image curation generated.');
    console.log('🖼️  Each campground has contextually appropriate images selected by AI.');
}

const startingUp = seedDB().then(() => {
    mongoose.connection.close()
})