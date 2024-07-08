const pool = require('../../db');
const queries = require('./queries');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

const addUserToDatabase = (user, cb) => {
    const { steamID, steamname, email } = user;
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        if (error) 
            throw error;
        if (results.rows.length)
            throw new Error("Email already exists");
        
        
        pool.query(querires.addUser, [steamID, steamname, new Date().toISOString().slice(0, 10), email], cb);
    })
}

const addUser = (req, res) => {
    try {
        addUserToDatabase(req.body, (error, results) => {
            if (error) 
                throw error;
            console.log(`User ${steamname} added`);
        });
        res.status(201).send("User added successfully.");
    } catch {
        res.status(500).send("Failed to add user to the database");
    }
}

const getUserById = (req, res) => {
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

const addFederatedCredentials = (identifier, profile, cb) => {

}

module.exports = {
    getUsers,
    addUserToDatabase,
    addUser,
    getUserById,
    removeUser,
    updateEmail,
};