const pool = require('../../db');
const queries = require('./tradesQueries');

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

const addNewTrade = (seller_id, buyer_id, asset_id) => {
    return new Promise((resolve, reject) => {
         pool.query(queries.addNewTrade, [seller_id, buyer_id, asset_id], (err, res) => {
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

module.exports = {
    getTrade,
    getTradesFromUser,
    getBuyingTradesFromUser,
    getSellingTradesFromUser,
    getTradeWithUsersAndItem,
    getTradesFromUserWithUserAndItem,
    addNewTrade,
    updateState,
}