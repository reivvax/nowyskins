const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE ID = $1";
const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const addUser = "INSERT INTO users (steamID, steamname, registration, email) VALUES ($1, $2, $3, $4)";
const removeUser = "DELETE FROM users WHERE steamID = $1";
const updateEmail = "UPDATE users SET email = $2 WHERE steamID = $1";
const addFederatedCredentials = "INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)"
const getFederatedCredentials = "SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2";

module.exports = {
    getUsers,
    getUserById,
    checkEmailExists,
    addUser,
    removeUser,
    updateEmail,
    addFederatedCredentials,
    getFederatedCredentials,
}