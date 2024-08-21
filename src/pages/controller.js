// Functions to render primary pages

const userUtils = require('../users/userUtils');
const item_maps = require('../utils/item_attributes_maps');
const steamItems = require('../steam_items/itemUtils');
const listedItems = require('../listed_items/itemUtils');

const renderIndex = (req, res) => {
    res.render('index', { user: req.user });
}

const renderMarket = (req, res) => {
    steamItems.getItems()
        .then(items => res.render('market', { user : req.user, items : items, maps : item_maps}))
        .catch(err => { console.log(err); res.redirect('/') });
}

const renderProfile = (req, res) => {
    res.render('profile', { user: req.user });
}

const renderSell = (req, res) => {
    steamItems.getFilteredSteamInventoryWithoutListedItems(req.user.steam_id, true)
        .then(items => res.render('sell', { user: req.user, items: items, maps : item_maps }))
        .catch(err => { console.log(err); res.redirect('/') });
}

const renderMyStall = (req, res) => {
    listedItems.getItemsFromUser(req.user.steam_id)
        .then(items => res.render('mystall', { user : req.user, items : items, maps : item_maps }))
        .catch(err => { console.log(err); res.redirect('/') });
}

const renderStall = (req, res) => {
    const id = req.params.id;
    if (req.isAuthenticated() && id === req.user.steam_id) { // render user's own stall
        res.redirect('/stall/me')
        return;
    }

    listedItems.getItemsFromUser(id)
        .then(items => {
            userUtils.getUserById(id)
                .then(seller => res.render('stall', { user : req.user, seller : seller, items : items, maps : item_maps }))
                .catch(err => { console.log(err); res.redirect('/') });
        })
        .catch((err) => { console.log(err); res.redirect('/') });
}

module.exports = {
    renderIndex,
    renderMarket,
    renderProfile,
    renderSell,
    renderMyStall,
    renderStall
}