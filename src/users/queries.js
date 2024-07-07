const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE ID = $1";
const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const addUser = "INSERT INTO users (steamID, steamname, registration, email) VALUES ($1, $2, $3, $4)";
const removeUser = "DELETE FROM users WHERE steamID = $1";
const updateEmail = "UPDATE users SET name = $2 WHERE steamID = $1";

module.exports = {
    getUsers,
    getUserById,
    checkEmailExists,
    addUser,
    removeUser,
    updateEmail,
}