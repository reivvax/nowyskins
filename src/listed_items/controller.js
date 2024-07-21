const utils = require('./itemUtils');

const addItem = (req, res) => {
    try {
        utils.addItemWithCheck(req.body);
        res.status(201).send("Item added successfully.");
    } catch {
        res.status(500).send("Failed to add item to the database");
    }
}


const fetchItemData = (req, res, next) => {
    const { asset_id, class_id, instance_id } = req.body;
    utils.fetchItemData(asset_id, class_id, instance_id, req.user.steam_id).then(item => {
        req.body = item;
        return next();
    }).catch(
        (err) => res.status(500).send("Failed to add item to database")
    );
}

const ensurePrivilegedToAdd = (req, res, next) => {
    const { asset_id } = req.body;
    utils.getRawInventory(req.user.steam_id).then(data => {
        if (!data.assets.map(asset => asset.assetid).includes(asset_id)) {
            console.log("UNATHORIZED TO LIST ITEM");
            res.status(401).redirect('/');
        }
        return next();
    }).catch(err => res.status(500).send("Failed to authorize:" + err));
}

const ensurePrivilegedToDelete = (req, res, next) => {
    const asset_id = req.params.id;
    utils.getItem(asset_id).then(item => {
        if (item.steam_id != req.user.steam_id) {
            console.log("UNPRIVILEGED TO DELETE ITEM");
            res.status(401).redirect('/');
        }
        return next();
    }).catch((err) => res.status(500).send("Failed to fetch item from database"));
}

const deleteItem = (req, res) => {
    try {
        utils.removeItem(req.params.id);
        res.status(200).send("Item removed successfully");
    } catch (err) {
        res.status(500).send("Failed to remove item from database");
    }
}

module.exports = {
    addItem,
    fetchItemData,
    ensurePrivilegedToAdd,
    ensurePrivilegedToDelete,
    deleteItem,
}