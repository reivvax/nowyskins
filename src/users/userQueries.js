const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE steam_id = $1";
const checkEmailExists = "SELECT * FROM users WHERE email = $1";
const addUser = "INSERT INTO users (steam_id, display_name, avatar) VALUES ($1, $2, $3) RETURNING *";
const removeUser = "DELETE FROM users WHERE steam_id = $1";
const updateEmail = "UPDATE users SET email = $2 WHERE steam_id = $1";
const updateTradelink = "UPDATE users SET tradelink = $2 WHERE steam_id = $1";
const updateEmailTradeLink = "UPDATE users SET email = $2, tradelink = $3 WHERE steam_id = $1";

module.exports = {
    getUsers,
    getUserById,
    checkEmailExists,
    addUser,
    removeUser,
    updateEmail,
    updateTradelink,
    updateEmailTradeLink,
}