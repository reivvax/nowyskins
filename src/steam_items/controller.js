const steamItems = require('./itemUtils');
const logs = require('../utils/logging');

const fetchItemData = (req, res, next) => {
    const { asset_id, class_id, instance_id, inspect_url, price } = req.body;
    steamItems.constructItem(req.user.steam_id, asset_id, class_id, instance_id, inspect_url).then(item => {
        req.body = item;
        req.body.price = price;
        return next();
    }).catch(
        (err) => { logs.debugLog(err); res.status(500).send("Failed to add item to database"); }
    );
}

const ensurePrivilegedToAdd = (req, res, next) => {
    const { asset_id } = req.body;
    steamItems.getRawSteamInventory(req.user.steam_id).then(data => {
        if (!data.assets.map(asset => asset.assetid).includes(asset_id)) {
            logs.debugLog("Unauthorized to list item");
            res.status(401).redirect('/');
        }
        return next();
    }).catch(err => res.status(500).send("Failed to authorize:" + err));
}

module.exports = {
    fetchItemData,
    ensurePrivilegedToAdd,
}