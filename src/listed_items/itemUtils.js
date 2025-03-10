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

const get = (query, params) => {
    return new Promise((resolve, reject) => {pool.query(query, params, (err, results) => {
            if (err)
                return reject(err);
            if (results.rows.length)
                return resolve(results.rows.map(mapValues));
            reject(new Error("Item not found"));
        });
    });
}

const getItem = (id) => {
    return get(queries.getItem, [id])
        .then(item => { return item[0]; });
}

const getItemByAsset = (asset_id) => {
    return get(queries.getItemByAsset, [asset_id])
        .then(item => {
            if (item instanceof Array) {
                item.sort((a, b) => new Date(b.time_added) - new Date(a.time_added));
                for (let i = 1; i < item.length; i++)
                    removeItem(item[i].asset_id);
                
                return item[0];
            } else {
                return item;
            }
        });
}

const isActive = (asset_id) => {
    return getItemByAsset(asset_id)
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

const addItemWithCheck = (item) => {
    return new Promise((resolve, reject) => {
        if (!item)
            return reject(new Error("Item is null"));

        pool.query(queries.getItemByAsset, [item.asset_id], (error, results) => {
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

const incrementWatchCount = (id, count) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.incrementWatchCount, [count, id], (error, result) => {
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
    getItemByAsset,
    isActive,
    getItemsFromUser,
    getActiveItemsFromUser,
    addItemToDatabase,
    addItemWithCheck,
    removeItem,
    updateStatus,
    incrementWatchCount 
}