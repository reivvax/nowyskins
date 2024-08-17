const request = require('request');
const pool = require('../../db');
const queries = require('./itemQueries');
const item_maps = require('../utils/item_attributes_maps');

var appid = '730'; // CS:GO 2
var contextid = '2'; // default CS:GO 2 context

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
    
    return pool.query(queries.getItem, [item.asset_id], (error, results) => {
        if (error) 
            throw error;
        if (!results.rows.length)
            return addItemToDatabase(item);
        else
            throw new Error("Item is already listed");
    });
}

const addItemToDatabase = (item) => {
    const { asset_id, name, quality, exterior, rarity, paint_wear, paint_seed, icon_url, inspect_url, steam_id } = item;
    return pool.query(
        queries.addItem, 
        [asset_id, name, quality, exterior, undefined, paint_wear, paint_seed, icon_url, inspect_url, steam_id], 
        (err, result) => {
            if (err) {
                throw err;
            };
            return result.rows[0];
        }
    );
}

const removeItem = (asset_id) => {
    pool.query(queries.removeItem, [asset_id], (error, result) => {
        if (error) throw error;
    })
};

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

const fillInspectLink = (steam_id, asset_id, inspect_url) => {
    return inspect_url.replace('%owner_steamid%', steam_id).replace('%assetid%', asset_id);
}

// Takes inspect link as an argument and returns an item object from steam API
// https://github.com/csfloat/inspect?tab=readme-ov-file#reply
const fetchRawItemData = (url) => {
    return new Promise((resolve, reject) => {
        request({
            uri: `http://${process.env['IP']}:${process.env['FLOAT_SERVICE_PORT']}/?url=${url}`,
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body) return reject(`Please check the parameters again, provided value: ${url}`);
            //Adjust values for own purposes
            resolve(body.iteminfo);
        });
    });
}

// Uses 'fetchRawItemData' and reconstructs the object to desired form:
// {
//  asset_id
//  name,
//  quality,
//  exterior,
//  rarity,
//  paint_wear,
//  paint_seed,
//  inspect_url,
//  icon_url,
//  steam_id
// }
const constructItemFromInspectLink = (steam_id, asset_id, inspect_url) => {
    const filled_url = fillInspectLink(steam_id, asset_id, inspect_url);
    return fetchRawItemData(filled_url).then(item => {
        item.asset_id = asset_id;
        item.steam_id = steam_id;
        item.name = item.weapon_type + ' | ' + item.item_name;
        item.paint_wear = item.floatvalue;
        item.paint_seed = item.paintseed;
        item.exterior = item_maps.exteriorMapStringToInt[item.wear_name];
        item.quality = item_maps.qualityMapStringToInt[item.quality];
        // item.rarity = item_maps.rarityMapStringToInt[item.rarity];
        item.icon_url = item.imageurl;
        item.inspect_url = filled_url;
        return item;
    }).catch((err) => { console.log(err); return null; });
}

const constructItemFromDescription = (steam_id, asset_id, description) => {
    if (description.actions) // has inspect link
        return constructItemFromInspectLink(steam_id, asset_id, description.actions[0].link); 
    // no inspect link
    return constructItemWithNoInspectLink(steam_id, asset_id, description.classid, description.instanceid);
}

const constructItem = (steam_id, asset_id, class_id, instance_id, inspect_url) => {
    if (!inspect_url || inspect_url === '')
        return constructItemWithNoInspectLink(steam_id, asset_id, class_id, instance_id);
    return constructItemFromInspectLink(steam_id, asset_id, inspect_url);
}

const constructItemWithNoInspectLink = (steam_id, asset_id, class_id, instance_id) => {
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
            // var rarity = item_maps.rarityMapStringToInt[getTagValue(description.tags, "Rarity")];
            const item = {
                asset_id: asset_id,
                class_id: class_id,
                instance_id: instance_id,
                name: body.name,
                quality: quality,
                exterior: exterior,
                rarity: undefined, 
                icon_url: body.icon_url,
                steam_id: steam_id
            };
            resolve(item);
        });
    })
}

// Returns raw steam inventory JSON from steam api
const getRawInventory = (steam_id) => {
    return new Promise((resolve, reject) => {
        request({
            // uri: `/inventory/76561198086056329/730/2?l=english`,
            uri: `/inventory/${steam_id}/${appid}/${contextid}?l=english`,
            baseUrl: 'https://steamcommunity.com/',
            json: true,
        }, (err, res, body) => {
            if (!body) return reject(`Please provide a steamid that exists, you provided value ${steam_id}`);
            if (err) return reject(err);
            resolve(body);
        });
    });
}

const desiredTags = [
    "weapon_", "knife_", "sticker_",
    "CSGO_Type_WeaponCase", "Type_CustomPlayer", "Type_Hands"
];

const filterFunction = (tags) => {
    return  desiredTags.includes(tags[0].internal_name) 
            ||
            desiredTags.some(type => tags[1].internal_name.toLowerCase().startsWith(type));
}

// Returns processed result from steam api, the result is array of objects
// {
//  asset_id,
//  name,
//  quality,
//  exterior,
//  rarity,
//  paint_wear,
//  paint_seed,
//  inspect_url,
//  icon_url,
//  steam_id
// }
const getFilteredInventory = (steam_id, tradeable) => {
    return new Promise((resolve, reject) => {
        if (typeof tradeable !== "boolean") {
            tradeable = false;
        }
        request({
            // uri: `/inventory/76561198086056329/730/2?l=english`,
            uri: `/inventory/${steam_id}/${appid}/${contextid}?l=english`,
            baseUrl: 'https://steamcommunity.com/',
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body) return reject(`Please provide a steamid that exists, you provided value ${steam_id}`);
            let descriptions = body.descriptions;
            let assets = body.assets;
            let data = [];

            const classidToDescription = descriptions.reduce((map, description) => {
                map[description.classid] = description;
                return map;
            }, {});

            assets.forEach(a => {
                let description = classidToDescription[a.classid];
                if ((!tradeable || description.tradable) && filterFunction(description.tags))
                    data.push(constructItemFromDescription(steam_id, a.assetid, description));
            });

            Promise.all(data.map(item => Promise.resolve(item)))
                .then(resolvedData => resolve(resolvedData.filter(item => item !== null)))
                .catch(err => reject(err));
        });
    })
}

module.exports = {
    getItems,
    getItem,
    getItemsFromUser,
    addItemWithCheck,
    addItemToDatabase,
    removeItem,
    constructItem,
    constructItemFromInspectLink,
    getRawInventory,
    getFilteredInventory,
}