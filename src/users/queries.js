const getUsers = "SELECT * FROM users";
const getUserById = "SELECT * FROM users WHERE ID = $1";

module.exports = {
    getUsers,
    getUserById,
}