const getItems = "SELECT * FROM listed_items";
const getActiveItems = "SELECT * FROM listed_items WHERE active = true";
const getItem = "SELECT * FROM listed_items WHERE id = $1";
const getItemByAsset = "SELECT * FROM listed_items WHERE asset_id = $1";
const addItem = "INSERT INTO listed_items (asset_id, d, name, quality, exterior, rarity, paint_wear, paint_seed, market_hash_name, icon_url, inspect_url, steam_id, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *";
const removeItem = "DELETE FROM listed_items WHERE asset_id = $1 RETURNING *";
const getItemsFromUser = "SELECT * FROM listed_items WHERE steam_id = $1";
const getActiveItemsFromUser = "SELECT * FROM listed_items WHERE steam_id = $1 AND active = true";
const updateStatus = "UPDATE listed_items SET active = $2 WHERE asset_id = $1 RETURNING *";
const incrementWatchCount = "UPDATE listed_items SET watched_by = watched_by + 1 WHERE id = $1 RETURNING *";

module.exports = {
    getItems,
    getActiveItems,
    getItem,
    getItemByAsset,
    addItem,
    removeItem,
    getItemsFromUser,
    getActiveItemsFromUser,
    updateStatus,
    incrementWatchCount
}