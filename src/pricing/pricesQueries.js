const getPrice = "SELECT price FROM prices WHERE weapon_name = $1 AND skin_name = $2 AND exterior = $3 AND quality = $4";
const addRecord = "INSERT INTO prices (type, weapon_name, skin_name, exterior, quality, price) VALUES ($1, $2, $3, $4, $5, $6)";
const updatePrice = "UPDATE prices SET price = $5 WHERE weapon_name = $1 AND skin_name = $2 AND exterior = $3 AND quality = $4"

module.exports = {
    getPrice,
    addRecord,
    updatePrice,
}