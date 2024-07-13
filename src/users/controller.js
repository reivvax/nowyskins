const pool = require('../../db');
const queries = require('./queries');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

const checkAndAddUser = (user, cb) => {
    if (!user) {
        console.log("User is null");
        return;
    }
    const { steam_id, display_name, avatar, profile_url, email } = user;
    
    if (email != null)
        pool.query(queries.checkEmailExists, [email], (error, results) => {
            if (error) 
                throw error;
            if (results.rows.length)
                throw new Error("Email already exists");
        });
    pool.query(queries.getUserById, [steam_id], (error, results) => {
        if (error) 
            throw error;
        if (!results.rows.length)
            addUserToDatabase(user, cb);
    });
}

const addUserToDatabase = (user) => {
    const { steam_id, display_name, avatar, profile_url } = user;
    return pool.query(queries.addUser, [steam_id, display_name, avatar, profile_url], (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        };
        return result.rows[0];
    });
}

const addUser = (req, res) => {
    try {
        checkAndAddUser(req.body);
        res.status(201).send("User added successfully.");
    } catch {
        res.status(500).send("Failed to add user to the database");
    }
}

const getUserById = (id) => {
    return result = pool.query(queries.getUserById, [id], (err, results) => {
        if (err) console.log(err);
        console.log(results);
        if (results.rows.length)
            return results.rows[0];
        return null;
    });
}

const getUserByIdRouting = (req, res) => {
    const ID = req.params.id;
    pool.query(queries.getUserById, [ID], (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

const removeUser = (req, res) => {
    const ID = req.params.id;
    
    pool.query(queries.getUserById, [ID], (error, result) => {
        const noUserFound = !results.rows.length;
        if (noUserFound) {
            res.send("User does not exist in the database.");
        }

        pool.query(queries.removeUser, [ID], (error, result) => {
            if (error) throw error;
            res.status(200).send("User removed successfully");
        })
    });
};

const updateEmail = (req, res) => {
    const ID = req.params.id;
    const { email } = req.body;

    pool.query(queries.getUserById, [ID], (error, results) => {
        const noUserFound = !results.rows.length;
        if (noUserFound) {
            res.send("User does not exist in the database.");
        }

        pool.query(queries.updateEmail, [ID, email], (error, resulsts) => {
            if (error) throw error;
            res.status(200).send("Email updated successfully");
        });
    });
};

module.exports = {
    getUsers,
    checkAndAddUser,
    addUserToDatabase,
    addUser,
    getUserById,
    getUserByIdRouting,
    removeUser,
    updateEmail,
};