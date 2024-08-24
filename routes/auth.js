var express = require('express');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var router = express.Router();
var pool = require('../db');
var steamItemsUtils = require('../src/steam_items/itemUtils');

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000',
    apiKey: process.env['STEAM_API_KEY'],
  }, 
  async (identifier, profile, cb) => {
    try {
      const { id, displayName, photos } = profile;
      const avatar = photos[0].value;
      const search = await pool.query('SELECT * FROM users WHERE steam_id = $1', [id]);
      let user = search.rows[0];
      if (!user) {
        const insertResult = await pool.query(
          "INSERT INTO users (steam_id, display_name, avatar) VALUES ($1, $2, $3) RETURNING *",
          [id, displayName, avatar.substring(32)]
        );
        user = insertResult.rows[0];
      };
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.steam_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const search = await pool.query('SELECT * FROM users WHERE steam_id = $1', [id]);
    let user = search.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

router.get('/login', passport.authenticate('steam'), (req, res) => {});

router.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // Load users items as soon as possible
    if (!req.user.email || !req.user.tradelink)
      steamItemsUtils.loadUsersInspectableItems(req.user.steam_id);

    // Successful authentication, redirect home.
    res.redirect('/');
  });


router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;