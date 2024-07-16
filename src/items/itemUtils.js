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

exports.getFilteredInventory = (steamid, tradeable) => {
    return this.getInventory(steamid, tradeable).then(data => {
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