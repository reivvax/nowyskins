const tradesUtils = require('./tradesUtils');
const listedItems = require('../listed_items/itemUtils');
const logs = require('../utils/logging');

/* Adds a new trade, assumes that the buying user is contained in req.user and the selling user in req.body */
const newTrade = (req, res) => {
    const { seller_id, asset_id } = req.body;
    tradesUtils.addNewTrade(seller_id, req.user.steam_id, asset_id)
        .then(res => res.status(201).send("Trade created successfully."))
        .catch(err => { logs.warnLog(err); res.status(500).send("Failed to create a new trade.") });
}

 /* Removes the listing of the item and creates a new trade */
const changeListingStatusAndCreateTrade = async (req, res) => {
    const { seller_id, asset_id } = req.body;
    try {
        await tradesUtils.changeListingStatusAndCreateTrade(seller_id, req.user.steam_id, asset_id);
        res.status(201).send("Trade created successfully.");
    } catch (err) {
        logs.debugLog(err);
        res.status(500).send("Failed to create a new trade.");
    }
}
const ensurePrivilegedToCreateTrade = (req, res, next) => {
    const { seller_id, asset_id } = req.body;
    listedItems.getItem(asset_id)
        .then(item => {
            if (item.steam_id != seller_id) {
                logs.verboseLog(`Unable to create offer because item ${asset_id} is not listed by user ${seller_id}`);
                res.status(401).redirect('/');
            } else if (!item.active) {
                logs.verboseLog(`Unable to create offer because item ${asset_id} is not active`);
                res.status(401).redirect('/');
            } else
                return next();
        })
        .catch(err => { logs.debugLog(err); res.status(500).send("Failed to fetch item from database"); })
}

module.exports = {
    newTrade,
    changeListingStatusAndCreateTrade,
    ensurePrivilegedToCreateTrade,
}