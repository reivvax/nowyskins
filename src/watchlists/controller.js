const utils = require('./watchlistsUtils');

const addToWatchlist = (req, res) => {
    const {steam_id, listing_id } = req.body;
    utils.addToWatchlist(steam_id, listing_id)
        .then((result) => {
            res.status(200).send("Item added to watchlist");
        })
        .catch((err) => {
            res.status(500).send("Failed to add item to watchlist");
        });
}

const removeFromWatchlist = (req, res) => {
    const {steam_id, listing_id } = req.body;
    if (steam_id != req.user.steam_id) {
        res.status(403).send("Forbidden");
        return;
    }
    utils.removeFromWatchlist(steam_id, listing_id)
        .then((result) => {
            res.status(200).send("Item removed from watchlist");
        })
        .catch((err) => {
            res.status(500).send("Failed to remove item from watchlist");
        });
}

module.exports = {
    addToWatchlist,
    removeFromWatchlist,
}