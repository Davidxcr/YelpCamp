require('dotenv').config()
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
const User = require('../models/user')

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

const campgroundDescriptions = [
    "Nestled among towering pine trees, this peaceful campground offers stunning mountain views and direct access to hiking trails. Perfect for families looking to disconnect and enjoy nature's beauty.",
    "Experience the great outdoors at this lakeside retreat featuring crystal-clear waters ideal for swimming, fishing, and kayaking. Each campsite includes a fire pit and picnic table.",
    "Wake up to breathtaking sunrise views over rolling hills at this scenic campground. Wildlife spotting opportunities abound, with deer, rabbits, and various bird species frequently seen.",
    "This riverside campground provides the perfect soundtrack of flowing water for a restful night's sleep. Excellent fishing spots and sandy beaches make it ideal for water enthusiasts.",
    "Surrounded by ancient oak trees, this historic campground has been welcoming visitors for generations. Clean facilities and well-maintained trails ensure a comfortable stay.",
    "Escape to this secluded forest campground where tall redwoods create a natural cathedral. Quiet and peaceful, it's perfect for meditation and reconnecting with nature.",
    "Located near a pristine alpine lake, this high-elevation campground offers cool summer temperatures and spectacular stargazing opportunities away from city lights.",
    "This desert oasis features unique rock formations and diverse desert wildlife. Spring wildflower blooms create a colorful carpet across the landscape.",
    "Perched on a cliff overlooking the ocean, this dramatic campground offers unparalleled sunset views and the soothing sound of crashing waves below.",
    "A family-friendly campground with spacious sites, clean restrooms, and a playground. Located within walking distance of a charming mountain town.",
    "This backcountry-style campground offers a true wilderness experience with minimal amenities but maximum natural beauty. Perfect for experienced campers seeking solitude.",
    "Situated in a meadow surrounded by wildflowers, this campground comes alive with color in spring and summer. Butterfly watching and photography opportunities abound.",
    "This historic mining town campground combines outdoor adventure with local history. Explore abandoned mines and learn about the area's gold rush heritage.",
    "A popular spot for rock climbing enthusiasts, this campground sits at the base of impressive granite cliffs. Climbing routes for all skill levels are nearby.",
    "This waterfront campground on a peaceful bay offers excellent crabbing and clamming opportunities. Rent kayaks on-site to explore hidden coves and inlets.",
    "Located in the heart of wine country, this campground provides easy access to local vineyards and tasting rooms while maintaining a natural, rustic atmosphere.",
    "This high-desert campground offers unique geological formations and some of the darkest skies in the region, making it a favorite among astronomers and stargazers.",
    "A working ranch campground where guests can participate in daily activities like horseback riding, cattle herding, and learning traditional ranch skills.",
    "This thermal springs campground features natural hot pools perfect for relaxation after a day of hiking. The mineral-rich waters are said to have healing properties.",
    "Surrounded by aspen groves that turn golden in fall, this campground offers spectacular autumn colors and crisp mountain air perfect for cozy campfires.",
    "This coastal campground provides direct beach access with opportunities for surfing, beachcombing, and watching migrating whales during certain seasons.",
    "A bird watcher's paradise, this wetland campground attracts hundreds of species throughout the year. Bring binoculars and a field guide for the best experience.",
    "This canyon campground features dramatic red rock formations and ancient petroglyphs. Guided tours are available to learn about the area's Native American history.",
    "Located near natural caves and underground formations, this campground offers unique spelunking opportunities for adventurous visitors.",
    "This prairie campground showcases the beauty of grasslands with endless views and spectacular lightning storms that illuminate the vast sky.",
    "A former logging camp turned peaceful retreat, this forested campground features old-growth trees and interpretive trails explaining the area's logging history.",
    "This island campground accessible only by boat offers the ultimate escape from civilization. Crystal-clear waters and pristine beaches surround the camping area.",
    "Situated along a famous scenic byway, this campground serves as an excellent base camp for exploring nearby national parks and monuments.",
    "This volcanic landscape campground features unique lava rock formations and geothermal features. Educational programs explain the area's geological significance.",
    "A winter sports enthusiast's dream, this campground transforms into a snowy wonderland with access to cross-country skiing and snowshoeing trails."
];

const seedDB = async () => {
    const existingUser = await User.findOne();
    if (!existingUser) {
        console.error('No user found, please create a user first');
        process.exit(1);
    }

    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: existingUser || '63b277c3879401d32fc2537f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: sample(campgroundDescriptions),
            price,
            geometry: {
                "type": "Point",
                "coordinates": [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
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
            ]
        })
        await camp.save()
    }

}
const startingUp = seedDB().then(() => {
    mongoose.connection.close()
})