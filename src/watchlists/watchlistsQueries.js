const addToWatchlist = "INSERT INTO watchlists (steam_id, listing_id) VALUES ($1, $2) RETURNING *";

const getListingIdsByUser = "SELECT listing_id FROM watchlists WHERE steam_id = $1";
const joinListings = `
SELECT
    listed_items.*
FROM 
    watchlists
JOIN 
    listed_items ON watchlists.listing_id = listed_items.id
WHERE 
    watchlists.steam_id = $1;`;

const removeFromWatchlist = "DELETE FROM watchlists WHERE steam_id = $1 AND listing_id = $2 RETURNING *";
const removeAllWatchesForListing = "DELETE FROM watchlists WHERE listing_id = $1 RETURNING *";

module.exports = {
    addToWatchlist,
    getListingIdsByUser,
    joinListings,
    removeFromWatchlist,
    removeAllWatchesForListing,
}