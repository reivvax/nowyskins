// Functions to render primary pages

const userUtils = require('../users/userUtils');
const item_maps = require('../utils/item_attributes_maps');
const steamItems = require('../steam_items/itemUtils');
const listedItems = require('../listed_items/itemUtils');
const tradesUtils = require('../trades/tradesUtils');
const logs = require('../utils/logging');

const renderIndex = (req, res) => {
    let message = req.query.message || null;
    res.render('index', { user: req.user, message: message });
}

const renderMarket = (req, res) => {
    listedItems.getActiveItems()
        .then(items => { res.render('market', { user : req.user, items : items, maps : item_maps})})
        .catch(err => { logs.warnLog(err); res.redirect('/') });
}

const renderProfile = (req, res) => {
    res.render('profile', { user: req.user });
}

const renderSell = (req, res) => {
    steamItems.getFilteredSteamInventoryWithoutListedItems(req.user.steam_id, true)
        .then(items => res.render('sell', { user: req.user, items: items, maps : item_maps }))
        .catch(err => { logs.warnLog(err); res.redirect('/') });
}

const renderMyStall = (req, res) => {
    listedItems.getActiveItemsFromUser(req.user.steam_id)
        .then(items => res.render('mystall', { user : req.user, items : items, maps : item_maps }))
        .catch(err => { logs.warnLog(err); res.redirect('/') });
}

const renderStall = (req, res) => {
    const id = req.params.id;
    if (req.isAuthenticated() && id === req.user.steam_id) { // render user's own stall
        res.redirect('/stall/me')
        return;
    }

    listedItems.getActiveItemsFromUser(id)
        .then(items => {
            userUtils.getUserById(id)
                .then(seller => res.render('stall', { user : req.user, seller : seller, items : items, maps : item_maps }))
        })
        .catch((err) => { logs.warnLog(err); res.redirect('/') });
}

const renderTrades = (req, res) => {
    const user = req.user;
    tradesUtils.getTradesFromUserWithUserAndItem(user.steam_id, user.display_name, user.avatar, user.tradelink)
        .then(trades => { res.render('trades', { user : user, trades : trades, maps : item_maps }) })
        .catch(err => { logs.warnLog(err); res.redirect('/'); })
}

module.exports = {
    renderIndex,
    renderMarket,
    renderProfile,
    renderSell,
    renderMyStall,
    renderStall,
    renderTrades
}