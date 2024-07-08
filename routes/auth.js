var express = require('express');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var userController = require('../src/users/controller');
var pool = require('../db');
var router = express.Router();
var queries = require('../src/users/queries');

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000',
    realm: 'http://localhost:3000',
    apiKey: process.env['STEAM_API_KEY'],
  }, 
  (identifier, profile, cb) => {
    console.log(profile);
    pool.query(queries.getFederatedCredentials, 
        [identifier, profile.id],
        (err, row) => {
            if (err) { return cb(err) };
            if (!row) { // no such user exists
                userController.addUserToDatabase({ steamID: profile.steamid, steamname: profile.steamname, email: null }, 
                  (err, results) => {
                    if (err) return cb(err);

                    var id = this.lastID;
                    pool.query(queries.addFederatedCredentials, [id, identifier, profile.id],
                      (err, results) => {
                        if (err) return cb(err);
                        var user = {
                          steamID: profile.steamid, 
                          steamname: profile.steamname
                        };
                        return cb(null, user);
                      }
                    );
                  }
                );
            } else { //user already registered
              pool.query(queries.getUserById, [row.steamid], (err, row) => {
                if (err) return cb(err);
                if (!row) return cb(null, false);
                return cb(null, row);
              })
            }
        }
    );
  }
));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
