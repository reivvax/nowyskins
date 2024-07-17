const request = require('request');
const pool = require('../../db');
const queries = require('./itemQueries');
var appid = '730'; // CS:GO 2
var contextid = '2'; // default context

const getItem = (asset_id) => {
    return pool.query(queries.getItem, [asset_id], (err, results) => {
        if (err)
            throw err;
        if (results.rows.length)
            return results.rows[0];
        return null;
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



const addItemWithCheck = (item) => {
    if (!item) {
        console.log("Item is null");
        throw new Error("Item is null");
    }
    const { asset_id } = item;
    
    pool.query(queries.getItem, [asset_id], (error, results) => {
        if (error) 
            throw error;
        if (!results.rows.length)
            addItemToDatabase(item);
    });
}

const addItemToDatabase = (item) => {
    const { asset_id, class_id, instance_id, name, quality, exterior, icon_url, inspect_url, steam_id } = item;
    return pool.query(queries.addItem, [asset_id, class_id, instance_id, name, quality, exterior, icon_url, inspect_url, steam_id], (err, result) => {
        if (err) {
            throw err;
        };
        return result.rows[0];
    });
}

const removeItem = (asset_id) => {
    pool.query(queries.removeItem, [asset_id], (error, result) => {
        if (error) throw error;
    })
};

const getInventory = (steamid, tradeable) => {
    return new Promise((resolve, reject) => {
        if (typeof appid !== 'number') {
            appid = 730;
        }
        if (!contextid) {
            contextid = 2;
        }
        if (typeof contextid === 'string') {
            contextid = parseInt(contextid);
        }
        if (typeof tradeable !== "boolean") {
            tradeable = false;
        }
        request({
            // uri: `/inventory/76561198086056329/730/2?l=english`,
            uri: `/inventory/${steamid}/${appid}/${contextid}?l=english`,
            baseUrl: 'https://steamcommunity.com/',
            json: true,
        }, (err, res, body) => {
            if (!body) return reject(`Please provide a steamid that exists, you provided value ${steamid}`);
            let descriptions = body.descriptions;
            let assets = body.assets;
            let data = [];

            const classidToDescription = descriptions.reduce((map, description) => {
                map[description.classid] = description;
                return map;
            }, {});

            assets.forEach(a => {
                data.push({
                    asset: a.assetid,
                    description: classidToDescription[a.classid],
                });
            });

            if (err) return reject(err);
            resolve(data);
        });
    })
}

const getFilteredInventory = (steamid, tradeable) => {
    return getInventory(steamid, tradeable).then(data => {
        const desiredTags = [
            "weapon_", "knife_", "sticker_",
            "CSGO_Type_WeaponCase", "Type_CustomPlayer", "Type_Hands"
        ];

        // filtering data
        data = data.filter(item => {
            return desiredTags.includes(item.description.tags[0].internal_name) ||
                   desiredTags.some(type => item.description.tags[1].internal_name.toLowerCase().startsWith(type)); 
        });
        return data;
    });
}

module.exports = {
    getItem,
    getItemsFromUser,
    addItemWithCheck,
    addItemToDatabase,
    removeItem,
    getInventory,
    getFilteredInventory,
}