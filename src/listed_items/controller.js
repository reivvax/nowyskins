const listedItems = require('./itemUtils');
const logs = require('../utils/logging');

const addItem = (req, res) => {
    listedItems.addItemWithCheck(req.body)
        .then(item => { res.status(201).send("Item added successfully"); })
        .catch(err => { logs.warn(err); res.status(500).send("Failed to add item to the database"); })
}

const ensurePrivilegedToDelete = (req, res, next) => {
    const asset_id = req.params.id;
    listedItems.getItem(asset_id)
        .then(item => {
            if (item.steam_id != req.user.steam_id) {
                logs.verboseLog(`User ${req.user.steam_id} unauthorized to delete item ${asset_id}`);
                res.status(401).redirect('/');
            } else
                return next();
        })
        .catch((err) => { logs.debugLog(err); res.status(500).send("Failed to fetch item from database") });
}

const deleteItem = (req, res) => {
    listedItems.removeItem(req.params.id)
        .then(() => { res.status(200).send("Item removed successfully"); })
        .catch(err => { log.debugLog(ere); res.status(500).send("Failed to remove item from database"); });
}

module.exports = {
    addItem,
    ensurePrivilegedToDelete,
    deleteItem,
}