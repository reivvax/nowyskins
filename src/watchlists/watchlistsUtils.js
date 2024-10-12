const queries = require('./watchlistsQueries');
const pool = require('../../db');

const addToWatchlist = (steam_id, listing_id) => {
    return new Promise((resolve, reject) => { pool.query(queries.addToWatchlist, [steam_id, listing_id], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.rows[0]);
        });
    });
}

const getListingIdsByUser = (steam_id) => {
    return new Promise((resolve, reject) => { pool.query(queries.getListingIdsByUser, [steam_id], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.rows);
        });
    });
}

const joinListings = (steam_id) => {
    return new Promise((resolve, reject) => { pool.query(queries.joinListings, [steam_id], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.rows);
        });
    });
}

const removeFromWatchlist = (steam_id, listing_id) => {
    return new Promise((resolve, reject) => { pool.query(queries.removeFromWatchlist, [steam_id, listing_id], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.rows[0]);
        });
    });
}

const removeAllWatchesForListing = (listing_id) => {
    return new Promise((resolve, reject) => { pool.query(queries.removeAllWatchesForListing, [listing_id], (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.rows);
        });
    });
}

module.exports = {
    addToWatchlist,
    getListingIdsByUser,
    joinListings,
    removeFromWatchlist,
    removeAllWatchesForListing,
}

