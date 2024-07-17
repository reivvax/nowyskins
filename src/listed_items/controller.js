const utils = require('./itemUtils');

const addItem = (req, res) => {
    try {
        utils.addItemWithCheck(req.body);
        res.status(201).send("Item added successfully.");
    } catch {
        res.status(500).send("Failed to add item to the database");
    }
}


module.exports = {
    addItem,
}