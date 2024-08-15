const request = require('request');
const pool = require('../../db');
const queries = require('./itemQueries');
const item_maps = require('../utils/item_attributes_maps');

var appid = '730'; // CS:GO 2
var contextid = '2'; // default CS:GO 2 context

const getItems = () => {
    return new Promise((resolve, object) => { pool.query(queries.getItems, (err, results) => {
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
    const { asset_id } = item;
    
    return pool.query(queries.getItem, [asset_id], (error, results) => {
        if (error) 
            throw error;
        if (!results.rows.length)
            return addItemToDatabase(item);
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
    // var filled_url = "steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S" + steam_id + "A" + asset_id + "D" + inspect_url.split("%D")[1]; 
}

// Takes inspect link as an argument
const fetchItemData = (url) => {
    return new Promise((resolve, reject) => {
        request({
            uri: `http://${process.env['IP']}:${process.env['FLOAT_SERVICE_PORT']}/?url=${url}`,
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body) return reject(`Please check the parameters again, provided value: ${url}`);
            resolve(body.iteminfo);
        });
    });
}

const constructItemFromInspectLink = (steam_id, asset_id, description, inspect_url) => {
    const filled_url = fillInspectLink(steam_id, asset_id, inspect_url);
    return fetchItemData(filled_url).then(item => {
        return {
            asset_id: asset_id,
            name: description.name,
            quality: item.quality,
            exterior: item.wear_name,
            rarity: item.rarity,
            paint_wear: item.floatvalue,
            paint_seed: item.paintseed,
            inspect_url: filled_url,
            icon_url: description.icon_url,
            steam_id: steam_id
        };
    }).catch((err) => { console.log(err); return null; });
}

const constructItemFromDescription = (steam_id, asset_id, description) => {
    if (description.actions) { // has inspect link
        return constructItemFromInspectLink(steam_id, asset_id, description, description.actions[0].link); 
    } else { // no inspect link
        var quality = item_maps.qualityMapStringToInt[getTagValue(description.tags, "Quality")];
        var exterior = item_maps.exteriorMapStringToInt[getTagValue(description.tags, "Exterior")];
    
        return {
            asset_id: asset_id,
            // class_id: description.classid,
            // instance_id: description.instanceid,
            name: description.name,
            quality: quality,
            exterior: exterior, 
            icon_url: description.icon_url,
            steam_id: steam_id
        }
    }
}


// const fetchItemData2 = (asset_id, class_id, instance_id, user_id) => {
//     return new Promise((resolve, reject) => {
//         request({
//             uri: `/?key=${process.env['STEAM_API_KEY']}&appid=${appid}&language=en&class_count=1&classid0=${class_id}&instanceid0=${instance_id}`,
//             baseUrl: 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/',
//             json: true,
//         }, (err, res, body) => {
//             if (err) return reject(err);
//             if (!body) return reject(`Please check the parameters again, provided values: ${class_id}, ${instance_id}`);
//             //process the body
//             const key = Object.keys(body.result)[0];
//             body = body.result[key];

//             var quality = item_maps.qualityMapStringToInt[getTagValue(body.tags, "Quality")];
//             var exterior = item_maps.exteriorMapStringToInt[getTagValue(body.tags, "Exterior")];
//             var inspect_url = body.actions ? body.actions[0].link.replace('%owner_steamid%', user_id).replace('%assetid%', asset_id) : undefined;

//             const item = {
//                 asset_id: asset_id,
//                 class_id: class_id,
//                 instance_id: instance_id,
//                 name: body.name,
//                 // paint_wear: undefined,
//                 seed: undefined, // TODO actually get those attributes
//                 quality: quality,
//                 exterior: exterior, 
//                 icon_url: body.icon_url,
//                 inspect_url: inspect_url,
//                 steam_id: user_id
//             }
//             resolve(item);
//         });
//     })
// }

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
    })
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
                    // data.push({
                    //     asset_id: a.assetid,
                    //     class_id: description.classid,
                    //     instance_id: description.instance_id,
                    //     inspect_url: description.actions ? fillInspectLink(steam_id, a.assetid, description.actions[0].link) : null,
                    //     exterior: getTagValue(description.tags, "Exterior"),
                    //     description: description
                    // });
            });

            Promise.all(data.map(item => Promise.resolve(item)))
                .then(resolvedData => resolve(resolvedData.filter(item => item !== null)))
                .catch(err => reject(err));
        });
    })
}

// const getFilteredInventory = (steam_id, tradeable) => {
//     return getInventory(steam_id, tradeable).then(data => {
//         const desiredTags = [
//             "weapon_", "knife_", "sticker_",
//             "CSGO_Type_WeaponCase", "Type_CustomPlayer", "Type_Hands"
//         ];

//         // filtering data
//         data = data.filter(item => {
//             return desiredTags.includes(item.description.tags[0].internal_name) ||
//                    desiredTags.some(type => item.description.tags[1].internal_name.toLowerCase().startsWith(type)); 
//         });
//         return data;
//     });
// }

module.exports = {
    getItems,
    getItem,
    getItemsFromUser,
    addItemWithCheck,
    addItemToDatabase,
    fetchItemData,
    removeItem,
    getRawInventory,
    getFilteredInventory,
}