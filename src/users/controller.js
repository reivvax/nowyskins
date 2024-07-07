const pool = require('../../db');
const queries = require('./queries');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

const addUser = (req, res) => {
    const { steamID, steamname, registration, email } = req.body;
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        if (results.rows.length) {
            res.send("Email already exists");
        }
        
        pool.query(querires.addUser, [steamID, steamname, registration, email], (error, results) => {
            if (error) throw error;
            res.status(201).send("User added successfully.");
            console.log(`User ${steamname} added`);
        });
    })
    
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

module.exports = {
    getUsers,
    addUser,
    getUserById,
    removeUser,
    updateEmail,
};