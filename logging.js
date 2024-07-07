const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');

const app = express();

// Passport session setup.
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: '0C06E370B15CE03CB2D2DFFA753DB89D'
  },
  (identifier, profile, done) => {
    process.nextTick(() => {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// Configure Express application.
app.use(session({ secret: 'your_secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('<h1>Welcome</h1><a href="/auth/steam">Login with Steam</a>');
});

app.get('/auth/steam',
  passport.authenticate('steam'),
  (req, res) => {
    // The request will be redirected to Steam for authentication, so this
    // function will not be called.
  }
);

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
      res.send(`<h1>Profile</h1><p>ID: ${req.user.id}</p><p>Display Name: ${req.user.displayName}</p><p>Avatar: <img src="${req.user.photos[0].value}"></p><a href="/">Home</a>`);
    } else {
      res.redirect('/');
    }
  });
  

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
