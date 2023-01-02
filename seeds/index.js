require('dotenv').config()
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

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

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            author: '619bf794c76d7a0d13a9c0d4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit.Doloremque libero earum et voluptates ? Obcaecati harum illo quasi.Iste, quasi sapiente labore ex velit, distinctio accusantium a quidem unde, ea mollitia!',
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