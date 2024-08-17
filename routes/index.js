//Routes for primary pages

const express = require('express');
const userUtils = require('../src/users/userUtils');
const itemUtils = require('../src/listed_items/itemUtils');
const item_maps = require('../src/utils/item_attributes_maps');
const ensureAuthenticated = require('../src/utils/ensure_authentication');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/market', (req, res) => {
    itemUtils.getItems().then(items => {
        res.render('market', { user : req.user, items : items, maps : item_maps});
    }).catch((err) => res.redirect('/'));
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/sell', ensureAuthenticated, (req, res) => {
    itemUtils.getFilteredInventory(req.user.steam_id, true).then(data => {
        itemUtils.getItemsFromUser(req.user.steam_id).then(listed_items => { // fetch listed items' ids, they won't be displayed in sell tab
            listed_items = listed_items.map(item => item.asset_id); 
            data = data.filter(item => !listed_items.includes(item.asset_id) );
            res.render('sell', { user: req.user, items: data, maps : item_maps });
        })
        .catch((err) => res.redirect('/'));
    }).catch((err) => res.redirect('/'));
});

router.get('/stall/me', ensureAuthenticated, (req, res) => {
    itemUtils.getItemsFromUser(req.user.steam_id).then(items => {
        res.render('mystall', { user : req.user, items : items, maps : item_maps });
    }).catch((err) => res.redirect('/'));
});

router.get('/stall/:id', (req, res) => {
    const id = req.params.id;
    itemUtils.getItemsFromUser(id).then(items => {
        if (req.isAuthenticated() && id === req.user.steam_id) { // render user's own stall
            res.render('mystall', { user : req.user, seller : req.user, items : items, maps : item_maps });
        } else { // render other user's stall
            userUtils.getUserById(id).then(seller => {
                res.render('stall', { user : req.user, seller : seller, items : items, maps : item_maps })
            }).catch(err => { throw err; });
        }
    }).catch((err) => res.redirect('/'));
});

module.exports = router;