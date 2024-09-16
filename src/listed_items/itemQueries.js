const getItems = "SELECT * FROM listed_items";
const getItem = "SELECT * FROM listed_items WHERE asset_id = $1";
const addItem = "INSERT INTO listed_items (asset_id, name, quality, exterior, rarity, paint_wear, paint_seed, market_hash_name, icon_url, inspect_url, steam_id, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *";
const removeItem = "DELETE FROM listed_items WHERE asset_id = $1 RETURNING *";
const getItemsFromUser = "SELECT * FROM listed_items WHERE steam_id = $1";

module.exports = {
    getItems,
    getItem,
    addItem,
    removeItem,
    getItemsFromUser,
}