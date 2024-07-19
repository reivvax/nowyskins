const express = require('express');
const userUtils = require('../src/users/userUtils');
const itemUtils = require('../src/listed_items/itemUtils');
const ensureAuthenticated = require('../utils/ensure_authentication');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/sell', ensureAuthenticated, (req, res) => {
    itemUtils.getFilteredInventory(req.user.steam_id, true).then(data => {
        itemUtils.getItemsFromUser(req.user.steam_id).then(listed_items => { // fetch listed items' ids, they won't be displayed in sell tab
            listed_items = listed_items.map(item => { return item.asset_id; }); 
            data = data.filter(item => { 
                return !listed_items.includes(item.asset_id); });
            res.render('sell', { user: req.user, items: data});
        })
        .catch((err) => res.redirect('/'));
    }).catch((err) => res.redirect('/'));
});

router.get('/stall/me', ensureAuthenticated, (req, res) => {
    itemUtils.getItemsFromUser(req.user.steam_id).then(items => {
        res.render('mystall', { user : req.user, items : items });
    }).catch((err) => res.redirect('/'));
});

router.get('/stall/:id', (req, res) => {
    const id = req.params.id;
    itemUtils.getItemsFromUser(id).then(items => {
        if (id === req.user.steam_id) { // render user's own stall
            res.render('mystall', { user : req.user, items : items });
        } else { // render other user's stall
            const user = userUtils.getUserById(id);
            if (!user)
                res.redirect('/');
            res.render('stall', { user : user, items : items });
        }
    }).catch((err) => res.redirect('/'));
});

module.exports = router;