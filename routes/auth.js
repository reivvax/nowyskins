var express = require('express');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var userController = require('../src/users/controller');
var router = express.Router();
var pool = require('../db');

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000',
    apiKey: process.env['STEAM_API_KEY'],
  }, 
  async (identifier, profile, cb) => {
    try {
      const { id, displayName, photos, _json: { profileurl } } = profile;
      const avatar = photos[0].value;
      // console.log(id, displayName, avatar, profileurl);
      const search = await pool.query('SELECT * FROM users WHERE steam_id = $1', [id]);
      let user = search.rows[0];
      if (!user) {
        const insertResult = await pool.query(
          "INSERT INTO users (steam_id, display_name, avatar, profile_url) VALUES ($1, $2, $3, $4) RETURNING *",
          [id, displayName, avatar, profileurl]
        );
        // user = userController.addUserToDatabase({
        //   steam_id: profile.id,
        //   display_name: profile.displayName,
        //   avatar: profile.photos[0].value,
        //   profile_url: profile._json.profileurl,
        //   email: null
        // });
        user = insertResult.rows[0];
      }
      // console.log(user);
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
    // Successful authentication, redirect home.
    res.redirect('/'); //or render()?
  });


router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;