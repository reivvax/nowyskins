const pool = require('../../db');
const queries = require('./tradesQueries');
const listedItemsUtils = require('../listed_items/itemUtils');
const trade_maps = require('../utils/trade_maps')

const mapState = (trade) => {
    trade.state_name = trade_maps.stateMap[trade.state];
    return trade;
}

const getTrade = (trade_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTrade, [trade_id], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(mapState(res.rows[0]));
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
                resolve(res.rows.map(mapState));
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
               resolve(mapState(res.rows[0]));
       });
   });
}

const getTradesFromUserWithUserAndItem = (user_id, display_name, avatar, tradelink) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getTradesFromUserWithUserAndItem, [user_id, display_name, avatar, tradelink], (err, res) => {
           if (err)
               reject(err);
           else
               resolve(res.rows.map(mapState));
       });
   });
}

const addNewTrade = (seller_id, buyer_id, asset_id, client) => {
    return new Promise((resolve, reject) => {
         (client ? client : pool).query(queries.addNewTrade, [seller_id, buyer_id, asset_id], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(mapState(res.rows[0]));
        });
    });
}

const updateState = (trade_id, state) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.updateState, [trade_id, state], (err, res) => {
           if (err)
               reject(err);
           else
               resolve(mapState(res.rows[0]));
       });
   })
}

const cancelTrade = async (trade_id) => {
    let trade = await updateState(trade_id, trade_maps.stateMap['Cancelled']);
    await listedItemsUtils.updateStatus(trade.asset_id, 'true');
}

/* Removes the listing of the item and creates a new trade using sql transaction */
const changeListingStatusAndCreateTrade = async (seller_id, buyer_id, asset_id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');    

        await listedItemsUtils.updateStatus(asset_id, 'false', client);
        await addNewTrade(seller_id, buyer_id, asset_id, client);

        await client.query('COMMIT');
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
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
    cancelTrade,
    changeListingStatusAndCreateTrade,
}