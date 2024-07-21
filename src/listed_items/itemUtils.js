const request = require('request');
const pool = require('../../db');
const queries = require('./itemQueries');
const item_maps = require('../utils/item_attributes_maps');

var appid = '730'; // CS:GO 2
var contextid = '2'; // default context

const getItems = () => {
    return new Promise((resolve, object) => { pool.query(queries.getItems, [], (err, results) => {
            if (err)
                reject(err);
            resolve(results);
        });
    })
}

const getItem = (asset_id) => {
    return new Promise((resolve, reject) => {pool.query(queries.getItem, [asset_id], (err, results) => {
            if (err)
                reject(err);
            if (results.rows.length)
                resolve(results.rows[0]);
            resolve(null);
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

const addItemWithCheck = (item) => {
    if (!item) {
        console.log("Item is null");
        throw new Error("Item is null");
    }
    const { asset_id } = item;
    
    return pool.query(queries.getItem, [asset_id], (error, results) => {
        if (error) 
            throw error;
        if (!results.rows.length)
            return addItemToDatabase(item);
    });
}

const addItemToDatabase = (item) => {
    console.log(item);
    const { asset_id, class_id, instance_id, name, quality, exterior, icon_url, inspect_url, steam_id } = item;
    return pool.query(queries.addItem, [asset_id, class_id, instance_id, name, quality, exterior, icon_url, inspect_url, steam_id], (err, result) => {
        if (err) {
            throw err;
        };
        return result.rows[0];
    });
}

const getTagValue = (tags, search) => {
    for (let tagId in tags) {
        if (tags.hasOwnProperty(tagId)) {
            let tagInfo = tags[tagId];
            if (tagInfo.category === search) {
                return tagInfo.name ? tagInfo.name : tagInfo.localized_tag_name;
            }
        }
    }
    return null;
}

const fetchItemData = (asset_id, class_id, instance_id, user_id) => {
    return new Promise((resolve, reject) => {
        request({
            uri: `/?key=${process.env['STEAM_API_KEY']}&appid=${appid}&language=en&class_count=1&classid0=${class_id}&instanceid0=${instance_id}`,
            baseUrl: 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/',
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body) return reject(`Please check the parameters again, provided values: ${class_id}, ${instance_id}`);
            //process the body
            const key = Object.keys(body.result)[0];
            body = body.result[key];

            var quality = item_maps.qualityMapStringToInt[getTagValue(body.tags, "Quality")];
            var exterior = item_maps.exteriorMapStringToInt[getTagValue(body.tags, "Exterior")];
            var inspect_url = body.actions ? body.actions[0].link.replace('%owner_steamid%', user_id).replace('%assetid%', asset_id) : undefined;

            const item = {
                asset_id: asset_id,
                class_id: class_id,
                instance_id: instance_id,
                name: body.name,
                // float: undefined,
                pattern: undefined, // TODO actually get those attributes
                quality: quality,
                exterior: exterior,
                icon_url: body.icon_url,
                inspect_url: inspect_url,
                steam_id: user_id
            }
            resolve(item);
        });
    })
}

const removeItem = (asset_id) => {
    pool.query(queries.removeItem, [asset_id], (error, result) => {
        if (error) throw error;
    })
};

// Returns raw result from steam api
const getRawInventory = (steamid) => {
    return new Promise((resolve, reject) => {
        request({
            // uri: `/inventory/76561198086056329/730/2?l=english`,
            uri: `/inventory/${steamid}/${appid}/${contextid}?l=english`,
            baseUrl: 'https://steamcommunity.com/',
            json: true,
        }, (err, res, body) => {
            if (!body) return reject(`Please provide a steamid that exists, you provided value ${steamid}`);
            if (err) return reject(err);
            resolve(body);
        });
    })
}

// Returns processed result from steam api, the result is array of objects
// {
//  asset_id
//  exterior (if applicable)
//  description
// }
const getInventory = (steamid, tradeable) => {
    return new Promise((resolve, reject) => {
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
                let description = classidToDescription[a.classid];
                if (!tradeable || description.tradable)
                    data.push({
                        asset_id: a.assetid,
                        exterior: getTagValue(description.tags, "Exterior"),
                        description: description,
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
    getItems,
    getItem,
    getItemsFromUser,
    addItemWithCheck,
    addItemToDatabase,
    fetchItemData,
    removeItem,
    getRawInventory,
    getInventory,
    getFilteredInventory,
}