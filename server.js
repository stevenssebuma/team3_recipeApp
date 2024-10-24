const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongodb = require('./data/database');
const bodyParser = require('body-parser');

//require for the OAuth2 security
require("dotenv").config()
const session = require("express-session")
const passport = require("passport")
const GitHubStrategy = require("passport-github2").Strategy

//was here orginally
app.use(bodyParser.json());

//session handling and passport(for OAuth2)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user)
})
passport.deserializeUser((obj, done) =>{
    done(null, obj)
})

//set up Github strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
},
(accessToken, refreshToken, profile, done) => {
    //here we can find or create a user in our db for access rights. For now we leave it at authenticating.
    return done(null, profile)
}
))

//rest of code was here originally.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Z-key'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/', require('./routes')); 

//use auth.js route
app.use('/auth', require('./routes/auth'))

mongodb.initDb((err) => {
    if(err) {
        console.log(err);
    }
    else {
        app.listen(port, () => {
            console.log(`Database is listening and node running at port ${port}`);
        });
    }
})