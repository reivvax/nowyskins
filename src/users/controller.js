const pool = require('../../db');
const queries = require('./queries');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, result) => {
        if (error) 
            console.error(error.stack);
        res.status(200).send(result.rows);
    });
};

module.exports = {
    getUsers,
};