//Utils to perform operations on listed items
const pool = require('../../db');
const queries = require('./itemQueries');

const getItems = () => {
    return new Promise((resolve, reject) => { pool.query(queries.getItems, (err, results) => {
            if (err)
                reject(err);
            resolve(results.rows);
        });
    })
}

const getItem = (asset_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getItem, [asset_id], (err, results) => {
            if (err)
                reject(err);
            if (results.rows.length)
                resolve(results.rows[0]);
            reject(new Error("Item not found"));
        });
    });
}

const getItemsFromUser = (steam_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getItemsFromUser, [steam_id], (err, results) => {
            if (err)
                reject(err);
            resolve(results.rows);
        });
    });
}

const addItemToDatabase = (item) => {
    const { asset_id, name, quality, exterior, rarity, paint_wear, paint_seed, icon_url, inspect_url, steam_id, price } = item;
    return new Promise((resolve, reject) => {
        pool.query(
            queries.addItem, 
            [asset_id, name, quality, exterior, undefined, paint_wear, paint_seed, icon_url, inspect_url, steam_id, price], 
            (err, result) => {
                if (err)
                    reject(err);
                resolve(result.rows[0]);
            }
        );
    });
}

const addItemWithCheck = (item) => {
    return new Promise((resolve, reject) => {
        if (!item) {
            console.log("Item is null");
            reject(new Error("Item is null"));
        }

        pool.query(queries.getItem, [item.asset_id], (error, results) => {
            if (error) 
                reject(error);
            if (!results.rows.length) { // no item with such id found
                addItemToDatabase(item)
                    .then(item => resolve(item))
                    .catch(err => { console.log(err); reject(err); });
            } else
                reject(new Error("Item is already listed"));
        });
    });
}

const removeItem = (asset_id) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.removeItem, [asset_id], (error, result) => {
            if (error) reject(error);
            resolve(result);
        });
    });
};


module.exports = {
    getItems,
    getItem,
    getItemsFromUser,
    addItemToDatabase,
    addItemWithCheck,
    removeItem,
}