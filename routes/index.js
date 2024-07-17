const express = require('express');
const userUtils = require('../src/users/userUtils');
const itemUtils = require('../src/listed_items/itemUtils');
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

router.get('/', (req, res) => {
    console.log("GETTING /");
    res.render('index', { user: req.user });
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/sell', ensureAuthenticated, (req, res) => {
    itemUtils.getFilteredInventory(req.user.steam_id, true).then(data => {
        res.render('sell', { user: req.user, items: data});
    });
});

router.get('/stall/me', ensureAuthenticated, (req, res) => {
    itemUtils.getItemsFromUser(req.user.steam_id).then(items => {
        console.log(items);
        
        res.render('stall', { user : req.user, items : items });
    });
});

router.get('/stall/:id', (req, res) => {
    const user = userUtils.getUserById(req.params.id);
    if (!user) {
        res.redirect('/');
    }
    // const listed_items =
    res.render('stall', { user : user });
});

module.exports = router;