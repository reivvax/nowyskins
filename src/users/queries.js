const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE steam_id = $1";
const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const addUser = "INSERT INTO users (steam_id, display_name, avatar, profile_url) VALUES ($1, $2, $3, $4) RETURNING *";
const removeUser = "DELETE FROM users WHERE steam_id = $1";
const updateEmail = "UPDATE users SET email = $2 WHERE steam_id = $1";

module.exports = {
    getUsers,
    getUserById,
    checkEmailExists,
    addUser,
    removeUser,
    updateEmail,
}