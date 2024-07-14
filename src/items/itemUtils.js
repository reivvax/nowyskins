const request = require('request');

var appid = '730'; // CS:GO 2
var contextid = '2';

exports.getInventory = (steamid, tradeable) => {
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
            uri: `/inventory/${steamid}/${appid}/${contextid}?l=english`,
            baseUrl: 'https://steamcommunity.com/',
            json: true,
        }, (err, res, body) => {
            if (!body) return reject(`Please provide a steamid that exists, you provided value ${steamid}`);
            let items = body.descriptions;
            let assets = body.assets
            let marketnames = [];
            let assetids = [];
            let data = {
                raw: body,
                items: items,
                marketnames: marketnames,
                assets: assets,
                assetids: assetids
            }
            if (items !== undefined) {
                for (var i = 0; i < items.length; i++) {
                    marketnames.push(items[i].market_hash_name);
                    assetids.push(assets[i].assetid);
                }
            } else if (items === undefined) {
                return reject("Couldn't find any items in the inventory of the appid you set. :(");
            }
            if (tradeable) {
                data.items = data.items.filter((x) => x.tradable === 1);
            }
            if (err) return reject(err);
            resolve(data);
        });
    })
}

exports.getFilteredInventory = (steamid, tradeable) => {
    return this.getInventory(steamid, tradeable).then(res => {
        const desiredTags = [
            "weapon_", "knife_", "gloves_", "sticker_",
            "CSGO_Type_WeaponCase", "CSGO_Tool_WeaponCase_Key", "Type_CustomPlayer"
        ];

        res.items = res.items.filter(item => {
            return desiredTags.includes(item.tags[0].internal_name) ||
                   desiredTags.some(type => item.tags[1].internal_name.toLowerCase().startsWith(type)); 
        });
        return res;
    });
}