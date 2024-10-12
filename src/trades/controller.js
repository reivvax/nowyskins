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
    listedItems.getItemByAsset(asset_id)
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

const ensureSellerPrivilegedToUpdateTrade = (req, res, next) => {
    const { trade_id } = req.params;
    tradesUtils.getTrade(trade_id)
        .then(trade => {
            if (trade.seller_id != req.user.steam_id || trade.state != 0) {
                logs.verboseLog(`Unable to update trade because user ${req.user.steam_id} is not the seller of trade ${trade_id}`);
                res.status(401).send('Unauthorized');
            } else
                return next();
        })
        .catch(err => { logs.debugLog(err); res.status(500).send("Failed to fetch trade from database"); })
}

const ensureBuyerPrivilegedToUpdateTrade = (req, res, next) => {
    const { trade_id } = req.params;
    tradesUtils.getTrade(trade_id)
        .then(trade => {
            if (trade.buyer_id != req.user.steam_id || trade.state != 2) { //TODO check if this check is valid
                logs.verboseLog(`Unable to update trade because user ${req.user.steam_id} is not the buyer of trade ${trade_id}`);
                res.status(401).send('Unauthorized');
            } else
                return next();
        })
        .catch(err => { logs.debugLog(err); res.status(500).send("Failed to fetch trade from database"); })
}

const acceptTrade = (req, res) => {
    const { trade_id } = req.params;
    tradesUtils.updateState(trade_id, 1)
        .then(() => { res.status(200).send("Trade accepted successfully.") })
        .catch(err => { logs.debugLog(err); res.status(500).send("Failed to accept trade.") });
}

const cancelTrade = (req, res) => {
    const { trade_id } = req.params;
    tradesUtils.cancelTrade(trade_id)
        .then(() => { res.status(200).send("Trade cancelled successfully.") })
        .catch(err => { logs.debugLog(err); res.status(500).send("Failed to cancel trade.") });
}

module.exports = {
    newTrade,
    changeListingStatusAndCreateTrade,
    ensurePrivilegedToCreateTrade,
    ensureSellerPrivilegedToUpdateTrade,
    ensureBuyerPrivilegedToUpdateTrade,
    acceptTrade,
    cancelTrade,
}