const getAllRecords = "SELECT * FROM prices";
const getAllHashNames = "SELECT market_hash_name FROM prices";
const getPrice = "SELECT price FROM prices WHERE market_hash_name = $1";
const addRecord = "INSERT INTO prices (market_hash_name, price) VALUES ($1, $2) RETURNING *";
const updatePrice = "UPDATE prices SET price = $2 WHERE market_hash_name = $1 RETURNING *";

module.exports = {
    getAllRecords,
    getAllHashNames,
    getPrice,
    addRecord,
    updatePrice,
}