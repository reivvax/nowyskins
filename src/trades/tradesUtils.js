const pool = require('../../db');
const queries = require('./tradesQueries');
const listedItemsQueries = require('../listed_items/itemQueries');

const getTrade = (trade_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTrade, [trade_id], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows[0]);
        });
    });
}

/* Helper method to get different types of trades from a user */
const getTrades = (steam_id, query) => {
    return new Promise((resolve, reject) => {
        pool.query(query, [steam_id], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows);
        });
    });
}

const getTradesFromUser = (steam_id) => {
    return getTrades(queries.getTradesFromUser, steam_id);
}

const getSellingTradesFromUser = (steam_id) => {
    return getTrades(queries.getSellingTradesFromUser, steam_id);
}

const getBuyingTradesFromUser = (steam_id) => {
    return getTrades(queries.getBuyingTradesFromUser, steam_id);
}

const getTradeWithUsersAndItem = (trade_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTradeWithUsersAndItem, [trade_id], (err, res) => {
           if (err)
               reject(err);
           else
               resolve(res.rows[0]);
       });
   });
}

const getTradesFromUserWithUserAndItem = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTradesFromUserWithUserAndItem, [user_id], (err, res) => {
           if (err)
               reject(err);
           else
               resolve(res.rows);
       });
   });
}

const addNewTrade = (seller_id, buyer_id, asset_id, client) => {
    return new Promise((resolve, reject) => {
         (client ? client : pool).query(queries.addNewTrade, [seller_id, buyer_id, asset_id], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows[0]);
        });
    });
}

const updateState = (trade_id, state) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.updateState, [trade_id, state], (err, res) => {
           if (err)
               reject(err);
           else
               resolve(res.rows[0]);
       });
   });
}

/* Removes the listing of the item and creates a new trade using sql transaction */
const removeListingAndCreateTrade = async (seller_id, buyer_id, asset_id) => {
    const res = false;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');    
        const deleteResult = await listedItemsQueries.removeItem(asset_id, client);

        if (deleteResult.rowCount == 0)
            throw new Error("Listing not found");

        await addNewTrade(seller_id, buyer_id, asset_id, client)
        await pool.query('COMMIT');
        res = true;
    } catch(err) {
        await pool.query('ROLLBACK');
        res = false;
    } finally {
        client.release();
        return res;
    }
}

module.exports = {
    getTrade,
    getTradesFromUser,
    getBuyingTradesFromUser,
    getSellingTradesFromUser,
    getTradeWithUsersAndItem,
    getTradesFromUserWithUserAndItem,
    addNewTrade,
    updateState,
    removeListingAndCreateTrade,
}