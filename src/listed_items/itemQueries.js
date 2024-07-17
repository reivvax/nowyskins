const getItem = "SELECT * FROM listed_items WHERE asset_id = $1";
const addItem = "INSERT INTO listed_items (asset_id, class_id, instance_id, quality, exterior, icon_url, inspect_url, steam_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
const removeItem = "DELETE FROM listed_items WHERE asset_id = $1";

module.exports = {
    getItem,
    addItem,
    removeItem,
}