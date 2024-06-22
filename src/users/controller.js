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
    const { steamname, registration } = req.body;
    
}

const getUserById = (req, res) => {
    const ID = parseInt(req.params.id);
    pool.query(queries.getUserById, [ID], (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

module.exports = {
    getUsers,
    addUser,
    getUserById,
};