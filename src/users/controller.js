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

    if (!validateEmail(email)) {
        res.status(400).send("Invalid email.");
    }

    try {
        utils.updateEmail(ID, email);
        res.status(200).send("User email updated successfully");
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(404).send("User does not exist in the database");
        } else if (error.code === '23505') {
            res.status(409).send("Email already exists");
        } else {
            res.status(500).send("Internal Server Error");
        }
    }
};

const updateTradeLink = (req, res) => {
    const ID = req.params.id;
    const { tradelink } = req.body;

    if (!validateTradeLink(ID, tradelink)) {
        res.status(400).send("Invalid trade link.");
    }

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

    if (!utils.validateEmail(email)) {
        res.status(400).send("Invalid email.");
        return;
    }
    if (!utils.validateTradeLink(ID, tradelink)) {
        res.status(400).send("Invalid trade link.");
        return;
    }

    utils.updateEmailTradeLink(ID, email, tradelink).then( 
        () => res.status(200).send("User email and tradelink updated successfully")
    ).catch(
        err => res.status(500).send("User does not exist in the database")
    );
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