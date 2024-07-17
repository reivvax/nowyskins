const pool = require('../../db');
const queries = require('./userQueries');
const utils = require('./userUtils');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, result) => {
        if (error)
            res.status(500).send('Internal Server Error');
        else
            res.status(200).send(result.rows);
    });
};

const addUser = (req, res) => {
    try {
        utils.addUserWithCheck(req.body);
        res.status(201).send("User added successfully.");
    } catch {
        res.status(500).send("Failed to add user to the database");
    }
}

const getUserById = (req, res) => {
    try {
        const res = utils.getUserById(req.params.id);
        if (!res)
            throw new Error("User does not exist in the database");
        res.status(200).send(res);
    } catch (error) {
        res.status(500).send("Error: ", error);
    }
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

    try {
        utils.updateEmail(ID, email);
        res.status(200).send("User email updated successfully");
    } catch (error) {
        res.status(500).send("User does not exist in the database")
    }
};

const updateTradeLink = (req, res) => {
    const ID = req.params.id;
    const { tradelink } = req.body;

    try {
        utils.updateTradelink(ID, tradelink);
        res.status(200).send("User tradelink updated successfully");
    } catch (error) {
        res.status(500).send("User does not exist in the database")
    }
};

const updateEmailTradeLink = (req, res) => {
    const ID = req.params.id;
    const { email, tradelink } = req.body;

    try {
        utils.updateEmailTradeLink(ID, email, tradelink);
        
        res.status(200).send("User email and tradelink updated successfully");
    } catch (error) {
        res.status(500).send("User does not exist in the database")
    }
};

module.exports = {
    getUsers,
    addUser,
    getUserById,
    removeUser,
    updateEmail,
    updateTradeLink,
    updateEmailTradeLink,
};