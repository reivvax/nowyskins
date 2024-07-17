const queries = require('./userQueries');
const pool = require('../../db');

const getUserById = (id) => {
    return result = pool.query(queries.getUserById, [id], (err, results) => {
        if (err)
            throw err;
        if (results.rows.length)
            return results.rows[0];
        return null;
    });
}

const addUserWithCheck = (user, cb) => {
    if (!user) {
        console.log("User is null");
        throw new Error("User is null");
    }
    const { steam_id, email } = user;
    
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
            throw err;
        };
        return result.rows[0];
    });
}

const updateEmail = (id, email) => {
    pool.query(queries.getUserById, [id], (err, results) => {
        if (err) {
            throw err;
        };
        
        const noUserFound = !results.rows.length;
        if (noUserFound)
            throw new Error();
        
        pool.query(queries.updateEmail, [id, email]);
    });
}

const updateTradelink = (id, tradelink) => {
    pool.query(queries.getUserById, [id], (err, results) => {
        if (err) {
            throw err;
        };
        
        const noUserFound = !results.rows.length;
        if (noUserFound)
            throw new Error();
        
        pool.query(queries.updateTradelink, [id, tradelink]);
    });
}

const updateEmailTradeLink = (id, email, tradelink) => {
    pool.query(queries.getUserById, [id], (err, results) => {
        if (err) {
            throw err;
        };
        
        const noUserFound = !results.rows.length;
        if (noUserFound)
            throw new Error();
        
        pool.query(queries.updateEmailTradeLink, [id, email, tradelink]);
    });
}

module.exports = {
    getUserById,
    addUserWithCheck,
    addUserToDatabase,
    updateEmail,
    updateTradelink,
    updateEmailTradeLink,
}