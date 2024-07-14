const express = require('express');
const itemUtils = require('../src/items/itemUtils');
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
  }

router.get('/', (req, res) => {
    console.log(req.isAuthenticated());
    console.log(req.user);
    res.render('index', { user: req.user });
});

router.get('/profile', ensureAuthenticated, function(req, res){
    res.render('profile', { user: req.user });
});

router.get('/sell', ensureAuthenticated, (req, res) => {
    itemUtils.getFilteredInventory(req.user.steam_id, 1).then(data => {
        res.render('sell', { user: req.user, items: data.items});
    });
});

module.exports = router;