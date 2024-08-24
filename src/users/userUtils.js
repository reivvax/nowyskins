const queries = require('./userQueries');
const pool = require('../../db');

const getUserById = (id) => {
    return new Promise((resolve, reject) => { pool.query(queries.getUserById, [id], (err, results) => {
            if (err)
                reject(err);
            if (results.rows.length)
                resolve(results.rows[0]);
            resolve(reject("No user found."));
        });
    });
}

const addUserWithCheck = (user) => {
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
            addUserToDatabase(user);
    });
}

const addUserToDatabase = (user) => {
    const { steam_id, display_name, avatar } = user;
    return pool.query(queries.addUser, [steam_id, display_name, avatar], (err, result) => {
        if (err) {
            throw err;
        };
        return result.rows[0];
    });
}

const validateEmail = (email) => {
    var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

const validateTradeLink = (steam_id, tradelink) => {
    regex = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=[a-zA-Z0-9]{8}$/;
    const match = tradelink.match(regex);
    const steamIDBase = 76561197960265728;
    return match != null && match.length >= 2 && parseInt(match[1], 10) + steamIDBase == steam_id;
}

const updateEmail = (id, email) => {
    pool.query(queries.getUserById, [id], (err, results) => {
        if (err) {
            throw err;
        }

        const noUserFound = !results.rows.length;
        if (noUserFound) {
            throw new Error('User not found');
        }

        pool.query(queries.updateEmail, [id, email], (err, results) => {
            if (err)
                throw err;
        });
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
    return new Promise((resolve, reject) => { pool.query(queries.getUserById, [id], (err, results) => {
            if (err)
                reject(err);
            
            const noUserFound = !results.rows.length;
            if (noUserFound)
                reject(new Error("User not found"));
            resolve(pool.query(queries.updateEmailTradeLink, [id, email, tradelink]));
        });
    });
}

module.exports = {
    getUserById,
    addUserWithCheck,
    addUserToDatabase,
    validateEmail,
    validateTradeLink,
    updateEmail,
    updateTradelink,
    updateEmailTradeLink,
}