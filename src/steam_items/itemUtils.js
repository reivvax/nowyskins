//Utils to perform operations on items from Steam/Valve API

const request = require('request');
const listedItemsUtils = require('../listed_items/itemUtils');
const item_maps = require('../utils/item_attributes_maps');
const pricingUtils = require('../pricing/pricingUtils');
const logs = require('../utils/logging');

var appid = '730'; // CS:GO 2
var contextid = '2'; // default CS:GO 2 context

/* Helper function to extract values of tags from raw JSON from Steam. */
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

/* 
    Helper function to fill the inspect link with proper data, 
    passing already filled inspect link does not change the link.
*/
const fillInspectLink = (steam_id, asset_id, inspect_url) => {
    return inspect_url.replace('%owner_steamid%', steam_id).replace('%assetid%', asset_id);
}

/**
 *   Takes inspect link as an argument, makes a call to external process that passes the request to the Valve server,
 *   returns raw result which is a detailed representation of an item.
 *   @link https://github.com/csfloat/inspect?tab=readme-ov-file#reply
*/
const fetchRawItemData = (url) => {
    return new Promise((resolve, reject) => {
        request({
            uri: `http://${process.env['IP']}:${process.env['FLOAT_SERVICE_PORT']}/?url=${url}`,
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body || !body.iteminfo) return reject(`Please check the parameters again, provided value: ${url}`);
            resolve(body.iteminfo);
        });
    });
}

/**
 *   Takes inspect links as arguments, makes a call to external process that passes the request to the Valve server,
 *   returns raw result which is a detailed representation of items.
 *   @link https://github.com/csfloat/inspect?tab=readme-ov-file#reply
*/
const fetchRawItemsData = (urls) => {
    let body = { bulk_key: process.env['FLOAT_SERVICE_BULK_KEY'], links: [] };
    for (link of urls)
        body.links.push({ link: link });

    return new Promise((resolve, reject) => {
        request({
            uri: `http://${process.env['IP']}:${process.env['FLOAT_SERVICE_PORT']}/bulk`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,    
            json: true
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body) return reject(`Please check the parameters again`);
            resolve(body);
        });
    });
}

/**
 * Takes an array of inspect links and returns array of objects that represent items, 
 * obtained from external process using bulk query.
 * @param links array of already filled inspect links
 */
   
const constructItemsFromInspectLinks = (steam_id, links) => {
    return fetchRawItemsData(links).then(body => {
        let result = [];
        for (key of Object.keys(body)) {
            var item = body[key];
            if (!item.error)
                result.push({
                    asset_id: key,
                    steam_id: steam_id,
                    name: item.weapon_type === "Sticker" ? item.full_item_name : item.weapon_type + ' | ' + item.item_name,
                    market_hash_name: item.full_item_name,
                    paint_wear: item.floatvalue,
                    paint_seed: item.paintseed,
                    exterior: item.wear_name ? item_maps.exteriorMapStringToInt[item.wear_name] : undefined,
                    quality: item.quality,
                    rarity: item.rarity,
                    icon_url: item.imageurl,
                    inspect_url: 'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S' + steam_id + 'A' + key + 'D' + item.d
                });
        }
        return result;
    }).catch(err => { return null; });
}

/** 
    Uses @function fetchRawItemData and reconstructs one object to desired form:
    @return {
        asset_id
        name,
        quality,
        exterior,
        rarity,
        market_hash_name,
        paint_wear,
        paint_seed,
        inspect_url,
        icon_url,
        steam_id
    }
*/
const constructItemFromInspectLink = (steam_id, inspect_url, asset_id) => {
    const filled_url = fillInspectLink(steam_id, asset_id, inspect_url);
    return fetchRawItemData(filled_url).then(item => {
        item.asset_id = asset_id;
        item.steam_id = steam_id;
        item.name = item.weapon_type + ' | ' + item.item_name;
        item.paint_wear = item.floatvalue;
        item.paint_seed = item.paintseed;
        item.exterior = item_maps.exteriorMapStringToInt[item.wear_name];
        item.market_hash_name = item.full_item_name
        item.icon_url = item.imageurl;
        item.inspect_url = filled_url;
        return item;
    }).catch((err) => { return null; });
}

/* Performs simple query about asset info to Steam server */
const querySteamAssetClassInfo = (uri) => {
    return new Promise((resolve, reject) => {
        request({
            uri: uri,
            baseUrl: 'https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/',
            json: true,
        }, (err, res, body) => {
            if (err) return reject(err);
            if (!body || body.error) return reject('Please check the parameters again');
            resolve(body);
        });
    });
}

/**
    Gets all the attributes of items and performs single query to Steam server to get details of items,
    using @function querySteamAssetClassInfo()
*/
const constructItemsWithNoInspectLink = (steam_id, items) => {
    var uri = `/?key=${process.env['STEAM_API_KEY']}&appid=${appid}&language=en&class_count=` + items.length;
    for (const [i, item] of items.entries())
        uri += '&classid' + i + '=' + item.class_id + '&instanceid' + i + '=' + item.instance_id;

    return new Promise((resolve, reject) => {
        querySteamAssetClassInfo(uri).then(body => {
            let result = [];

            for (item of items) {
                var data = body.result[item.instance_id == '0' ? item.class_id : item.class_id + '_' + item.instance_id];
                var quality = item_maps.qualityMapStringToInt[getTagValue(data.tags, "Quality")];
                var exterior = item_maps.exteriorMapStringToInt[getTagValue(data.tags, "Exterior")];
                // var rarity = item_maps.rarityMapStringToInt[getTagValue(item.tags, "Rarity")];
                
                result.push({
                    asset_id: item.asset_id,
                    class_id: item.class_id,
                    instance_id: item.instance_id,
                    name: data.name,
                    quality: quality,
                    exterior: exterior,
                    rarity: undefined, 
                    market_hash_name: data.market_hash_name,
                    icon_url: data.icon_url,
                    steam_id: steam_id
                });
            }
            resolve(result);
        });
    });
}

/**
    Gets all the attributes of an item and performs single query to Steam server to get details of an item,
    using @function querySteamAssetClassInfo()
*/
const constructItemWithNoInspectLink = (steam_id, asset_id, class_id, instance_id) => {
    var uri = `/?key=${process.env['STEAM_API_KEY']}&appid=${appid}&language=en&class_count=1&classid0=${class_id}&instanceid0=${instance_id}`;
    return new Promise((resolve, reject) => {
         querySteamAssetClassInfo(uri).then(body => {
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
                market_hash_name: body.market_hash_name,
                icon_url: body.icon_url,
                steam_id: steam_id
            };
            resolve(item);
        });
    });
}

/* Constructs an item object. */
const constructItem = (steam_id, asset_id, class_id, instance_id, inspect_url) => {
    if (!inspect_url || inspect_url === '')
        return constructItemWithNoInspectLink(steam_id, asset_id, class_id, instance_id);
    return constructItemFromInspectLink(steam_id, inspect_url, asset_id);
}

/* Returns raw Steam inventory JSON from Steam api */
const getRawSteamInventory = (steam_id) => {
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

/* Completes provided items with their prices */
const completeItemsWithPrices = (items) => {
    return new Promise((resolve, reject) => {
        let names = new Set();

        items.forEach(item => {
            names.add(item.market_hash_name);
        });

        let pricePromises = Array.from(names).map(hash_name => {
            return pricingUtils.getPrice(hash_name)
                .then(price => ({ hash_name: hash_name, price }));
        });

        Promise.all(pricePromises)
            .then(resolvedPrices => {
                let priceMap = {}; 
                resolvedPrices.forEach(({ hash_name, price }) => {
                    priceMap[hash_name] = price;
                });

                items.forEach(item => {
                    item.price = priceMap[item.market_hash_name];
                    if (item.price == "-1") {
                        item.price = undefined;
                    }
                });
                resolve(items); })
            .catch(err => { 
                logs.warnLog(err); 
                resolve(items); 
            });
    });
}

/* Tag values for items that are to be displayed */
const desiredTags = [
    "weapon_", "knife_",
    "CSGO_Type_WeaponCase", "Type_CustomPlayer", "Type_Hands", "StickerCategory"
];

/* Filtering function used to filter out graffiti and keys */
const filterFunction = (tags) => {
    return  desiredTags.includes(tags[0].internal_name) 
            ||
            desiredTags.some(type => tags[1].internal_name.toLowerCase().startsWith(type))
            ||
            tags.some(tag => tag.category === "StickerCategory")
}

/** Returns result from Steam/Valve api, items like graffiti and keys are filtered out, 
the result is an array of objects:
@returns {
 asset_id,
 name,
 quality,
 exterior,
 rarity,
 market_hash_name,
 paint_wear,
 paint_seed,
 inspect_url,
 icon_url,
 price,
 steam_id
}
*/
const getFilteredSteamInventory = (steam_id, tradeable) => {
    return new Promise((resolve, reject) => {
        getRawSteamInventory(steam_id, tradeable).then(body => {
            let descriptions = body.descriptions;
            let assets = body.assets;
            
            const classidToDescription = descriptions.reduce((map, description) => {
                map[description.classid] = description;
                return map;
            }, {});

            let inspectableItems = [];
            let notInspectableItems = [];

            assets.forEach(a => {
                let description = classidToDescription[a.classid];
                if ((!tradeable || description.tradable) && filterFunction(description.tags)) {
                    if (description.actions && description.tags[0].internal_name !== "CSGO_Tool_Sticker") // has inspect link and is not a sticker
                        inspectableItems.push(fillInspectLink(steam_id, a.assetid, description.actions[0].link));
                    else // no inspect link
                        notInspectableItems.push({ asset_id: a.assetid, class_id: description.classid, instance_id: description.instanceid });
                }
            });

            let data = [];

            // Merge inspectable and not inspectable items to one array
            constructItemsFromInspectLinks(steam_id, inspectableItems).then(inspectItems => {
                data = inspectItems;
                constructItemsWithNoInspectLink(steam_id, notInspectableItems).then(noInspectItems => {
                    data = data.concat(noInspectItems);
                    completeItemsWithPrices(data).then(pricedItems => { // Add prices
                        Promise.all(pricedItems.map(item => Promise.resolve(item))).then(resolvedData => 
                            resolve(resolvedData.filter(item => item !== null))
                        );
                    }).catch(err => reject(err));
                });
            });
        }).catch(err => reject(err));
    });
}

/** Returns result from Steam/Valve api, items like graffiti and keys are filtered out, 
also items that are alreay marked as listed in the system are omitted
the result is an array of objects:
@returns {
 asset_id,
 name,
 quality,
 exterior,
 rarity,
 market_hash_name,
 paint_wear,
 paint_seed,
 inspect_url,
 icon_url,
 price,
 steam_id
}
*/
const getFilteredSteamInventoryWithoutListedItems = (steam_id, tradeable) => {
    return new Promise((resolve, reject) => {
        getFilteredSteamInventory(steam_id, tradeable).then(data => {
            listedItemsUtils.getItemsFromUser(steam_id).then(listed_items => { // fetch listed items' ids, they will be filtered out
                listed_items = listed_items.map(item => item.asset_id); 
                resolve(data.filter(item => !listed_items.includes(item.asset_id)));
            }).catch((err) => reject(err));
        }).catch(err => reject(err));
    })
}


/**
 * Loads user's items to the database. Is called when user logs in for the first time
 * @param steam_id
 */
const loadUsersInspectableItems = (steam_id) => {
    getRawSteamInventory(steam_id, true).then(body => {
        let descriptions = body.descriptions;
        let assets = body.assets;
        
        const classidToDescription = descriptions.reduce((map, description) => {
            map[description.classid] = description;
            return map;
        }, {});

        let inspectableItems = [];

        assets.forEach(a => {
            let description = classidToDescription[a.classid];
            if ((description.tradable) && filterFunction(description.tags)) {
                if (description.actions) // has inspect link
                    inspectableItems.push(fillInspectLink(steam_id, a.assetid, description.actions[0].link));
            }
        });

        fetchRawItemsData(inspectableItems);
    }).catch(err => reject(err));
}


module.exports = {
    constructItem,
    constructItemFromInspectLink,
    getRawSteamInventory,
    getFilteredSteamInventory,
    getFilteredSteamInventoryWithoutListedItems,
    loadUsersInspectableItems
}