const listedItems = require('./itemUtils');
const logs = require('../utils/logging');

const addItem = (req, res) => {
    listedItems.addItemWithCheck(req.body)
        .then(item => { res.status(201).send("Item added successfully"); })
        .catch(err => { logs.warnLog(err); res.status(500).send("Failed to add item to the database"); })
}

const checkIfListingExists = (req, res, next) => {
    return listedItems.getItem(req.body.asset_id)
        .then(item => { return next(); })
        .catch(err => { 
                logs.verboseLog(err);
            if (err.message == "Item not found")
                return res.status(404).send(err.message);
            else
                return res.status(500).send(err.message);
        });
}

const checkIfListingActive = async (req, res, next) => {
    try {
        let active = await listedItems.isActive(req.body.asset_id);
        if (active)
            return next();
        else
            return res.status(404).send("Listing not active.");
    } catch (err) {
        logs.verboseLog(err);
        if (err.message == "Item not found")
            return res.status(404).send(err.message);
        else
            return res.status(500).send(err.message);
    }
}

const ensurePrivilegedToDelete = (req, res, next) => {
    const asset_id = req.params.id;
    listedItems.getItem(asset_id)
        .then(item => {
            if (item.steam_id != req.user.steam_id) {
                logs.verboseLog(`User ${req.user.steam_id} unauthorized to delete item ${asset_id}`);
                return res.status(401).redirect('/');
            } else
                return next();
        })
        .catch((err) => { logs.debugLog(err); return res.status(500).send("Failed to fetch item from database") });
}

const deleteItem = (req, res) => {
    listedItems.removeItem(req.params.id)
        .then(() => { return res.status(200).send("Item removed successfully"); })
        .catch(err => { log.debugLog(ere); return res.status(500).send("Failed to remove item from database"); });
}

module.exports = {
    addItem,
    checkIfListingExists,
    checkIfListingActive,
    ensurePrivilegedToDelete,
    deleteItem,
}