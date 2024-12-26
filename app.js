require('dotenv').config()
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const userRoutes = require('./routes/user')
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const MongoDBStore = require("connect-mongo");
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
mongoose.set('strictQuery', true);

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})


store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://app.intercom.io",
    "https://widget.intercom.io",
    "https://js.intercomcdn.com"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://via.intercom.io",
    "https://api.intercom.io",
    "https://api.au.intercom.io",
    "https://api.eu.intercom.io",
    "https://api-iam.intercom.io",
    "https://api-iam.eu.intercom.io",
    "https://api-iam.au.intercom.io",
    "https://api-ping.intercom.io",
    "https://nexus-websocket-a.intercom.io",
    "wss://nexus-websocket-a.intercom.io",
    "https://nexus-websocket-b.intercom.io",
    "wss://nexus-websocket-b.intercom.io",
    "https://nexus-europe-websocket.intercom.io",
    "wss://nexus-europe-websocket.intercom.io",
    "https://nexus-australia-websocket.intercom.io",
    "wss://nexus-australia-websocket.intercom.io"
];
const fontSrcUrls = [
    "https://js.intercomcdn.com",
    "https://fonts.intercomcdn.com"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/david-codes/", // Should match your Cloudinary account
                "https://images.unsplash.com/",
                "https://uploads.intercomcdn.com",
                "https://uploads.intercomcdn.eu",
                "https://uploads.au.intercomcdn.com",
                "https://uploads.eu.intercomcdn.com",
                "https://uploads.intercomusercontent.com",
                "https://via.intercom.io",
                "https://api.intercom.io",
                "https://api.au.intercom.io",
                "https://api.eu.intercom.io",
                "https://api-iam.intercom.io",
                "https://api-iam.eu.intercom.io",
                "https://api-iam.au.intercom.io",
                "https://api-ping.intercom.io",
                "https://nexus-websocket-a.intercom.io",
                "wss://nexus-websocket-a.intercom.io",
                "https://nexus-websocket-b.intercom.io",
                "wss://nexus-websocket-b.intercom.io",
                "https://nexus-europe-websocket.intercom.io",
                "wss://nexus-europe-websocket.intercom.io",
                "https://nexus-australia-websocket.intercom.io",
                "wss://nexus-australia-websocket.intercom.io",
                "https://downloads.intercomcdn.com",
                "https://static.intercomassets.com"
            ],
            childSrc: ["blob:"],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Login route
app.get('/login', (req, res) => {
    res.render('boilerplate', { currentUser: req.user });
});
//Logout route
app.get('/logout', (req, res) => {
    res.render('/logout');
});


app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
