//Utils to perform operations on listed items
const pool = require('../../db');
const queries = require('./itemQueries');
const maps = require('../utils/item_attributes_maps');

const mapValues = (item) => {
    item.exterior_name = maps.exteriorMap[item.exterior];
    item.quality_name = maps.qualityMap[item.quality];
    return item;
}

const getItems = () => {
    return new Promise((resolve, reject) => { pool.query(queries.getItems, (err, results) => {
            if (err)
                return reject(err);
            resolve(results.rows.map(mapValues));
        });
    });
}

const getActiveItems = () => {
    return new Promise((resolve, reject) => { pool.query(queries.getActiveItems, (err, results) => {
            if (err)
                return reject(err);
            resolve(results.rows.map(mapValues));
        });
    });
}

const getItem = (asset_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getItem, [asset_id], (err, results) => {
            if (err)
                return reject(err);
            if (results.rows.length)
                return resolve(mapValues(results.rows[0]));
            reject(new Error("Item not found"));
        });
    });
}

const isActive = (asset_id) => {
    return getItem(asset_id)
        .then(item => { return item.active; })
        .catch(err => { return false; } );
}    

const getItemsFromUser = (steam_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getItemsFromUser, [steam_id], (err, results) => {
            if (err)
                return reject(err);
            resolve(results.rows.map(mapValues));
        });
    });
}

const getActiveItemsFromUser = (steam_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getActiveItemsFromUser, [steam_id], (err, results) => {
            if (err)
                return reject(err);
            resolve(results.rows.map(mapValues));
        });
    });
}

const addItemToDatabase = (item) => {
    const { asset_id, d, name, quality, exterior, rarity, paint_wear, paint_seed, market_hash_name, icon_url, inspect_url, steam_id, price } = item;
    return new Promise((resolve, reject) => {
        pool.query(
            queries.addItem, 
            [asset_id, d, name, quality, exterior, undefined, paint_wear, paint_seed, market_hash_name, icon_url, inspect_url, steam_id, price], 
            (err, result) => {
                if (err)
                    return reject(err);
                resolve(mapValues(result.rows[0]));
            }
        );
    });
}

const addItemWithCheck = (item, client) => {
    return new Promise((resolve, reject) => {
        if (!item)
            return reject(new Error("Item is null"));

        (client ? client : pool).query(queries.getItem, [item.asset_id], (error, results) => {
            if (error) 
                reject(error);
            if (!results.rows.length) { // no item with such id found
                addItemToDatabase(item)
                    .then(item => resolve(mapValues(item)))
                    .catch(err => { reject(err); });
            } else
                reject(new Error("Item is already listed"));
        });
    });
}

const removeItem = (asset_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.removeItem, [asset_id], (error, result) => {
            if (error) 
                return reject(error);
            if (result.rowCount > 0)
                resolve(mapValues(result.rows[0]));
            else
                reject(new Error("Item not found"));
        });
    });
};

const updateStatus = (asset_id, status, client) => {
    return new Promise((resolve, reject) => {
        (client ? client : pool).query(queries.updateStatus, [asset_id, status], (error, result) => {
            if (error) 
                return reject(error);
            if (result.rowCount > 0)
                resolve(mapValues(result.rows[0]));
            else
                reject(new Error("Item not found"));
        });
    });
}

module.exports = {
    getItems,
    getActiveItems,
    getItem,
    isActive,
    getItemsFromUser,
    getActiveItemsFromUser,
    addItemToDatabase,
    addItemWithCheck,
    removeItem,
    updateStatus,
}