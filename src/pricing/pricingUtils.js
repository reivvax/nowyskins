const pricesRequests = require('./pricesRequests');
const queries = require('./pricesQueries');
const { spawn } = require('child_process');
const pool = require('../../db');
const logs = require('../utils/logging');

const getAllRecords = () => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getAllRecords, [], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows);
        });
    }).catch(err => {
        logs.debugLog("Failed to get all price records: ", err);
        return [];
    });
}

const getAllHashNames = () => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getAllHashNames, [], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows.map(record => { return record.market_hash_name; }));
        });
    }).catch(err => {
        logs.debugLog("Failed to get all price records: ", err);
        return [];
    });
}

const addRecord = (market_hash_name, price) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.addRecord, [market_hash_name, price], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows[0].price);
        });
    }).catch(err => {
        logs.debugLog("Failed to add price record: ", err); 
        return price; 
    });
}

const getItemPriceFromDatabase = (market_hash_name) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getPrice, [market_hash_name], (err, res) => {
            if (err) {
                logs.warnLog(err);
                reject(err);
            }
            if (res.rows.length)
                resolve(res.rows[0].price);
            else
                reject(new Error("Item not found")); // no match
        });
    });
}

const updatePrice = (market_hash_name, price) => {
    return new Promise((resolve, reject) => { 
        pool.query(queries.updatePrice, [market_hash_name, price], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res.rows[0]);
        });
    }).catch(err => {
        logs.debugLog(err);
        return -1;
    })
}

/**
 * Helper function that runs the python scrapping script
 * @param url URL of site to scrap the data from, in form 'https://csgo.steamanalyst.com/skin/{skin_name}'
 * @param wear string representation of wear, if item does not have wear, then '-' or ''
 * @returns Promise that returns desired price, or throws an error if script fails to execute
 */
const fetchPriceFromCSAnalyst = (url, wear) => {
    return new Promise((resolve, reject) => {
        if (wear == '')
            wear = '-';
        args = [url, wear];

        const pythonProcess = spawn('python', ['scrapper.py', ...args]);

        pythonProcess.on('close', (code) => {
            if (code != 0) {
                logs.warnLog(`Scrapping script finished with code ${code}`);
                reject(new Error("Failed to execute the script"));
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            data = data.toString();
            if (data.startsWith("Error"))
                logs.debugLog(`Pcrapping script: ${data.substring(7)}`);
        });

        pythonProcess.stdout.on('data', (data) => {
            data = data.toString().trim();
            resolve(data);
        });
    });
}

let exteriors = [
    "Battle-Scarred",
    "Well-Worn",
    "Field-Tested",
    "Minimal Wear",
    "Factory New"
]

/* Extracts the wear string value from market hash name, if the item does not contain wear parameter, returns empty string */
const getWearFromMarketHashName = (market_hash_name) => {
    let res = '';
    if (market_hash_name.charAt(market_hash_name.length - 1) == ')') {
        for (let e of exteriors) {
            if (market_hash_name.endsWith(e, market_hash_name.length - 1)) {
                res = e;
                break;
            }
        }
    }
    return res;
}

/* Construct the suffix of CSAnalyst link based on market hash name and ordinary name */
const constructLinkSuffix = (market_hash_name, wear) => {
    let res = '';
    if (market_hash_name.startsWith('★')) {
        market_hash_name = market_hash_name.substring(1).trim();
    }
    
    if (market_hash_name.startsWith("StatTrak")) {
        res += 'stattrak-';
        market_hash_name = market_hash_name.substring(10); // 'StatTrak™ ' is 10 characters long
    }

    if (wear) {
        let newLength = market_hash_name.length - wear.length - 3;
        market_hash_name = market_hash_name.substring(0, newLength);
    }

    res += market_hash_name.replace(/ \| | |\(|\)|\./g, "-").replace(/-+/g, "-").toLowerCase(); // replace spaces and ' | ' to dashes and make lowercase
    return res;
}

const fetchAndCallback = (market_hash_name, cb) => {
    const wear = getWearFromMarketHashName(market_hash_name);
    return fetchPriceFromCSAnalyst("https://csgo.steamanalyst.com/skin/" + constructLinkSuffix(market_hash_name, wear), wear)
        .then(price => { // successful fetch from cs analyst
            if (price != -1)
                return cb(market_hash_name, price)
            else
                throw new Error(`Failed to fetch price from CSAnalyst for ${market_hash_name}`);
        })
        .catch(err => { // failed to fetch from CSAnalyst
            logs.verboseLog(err.message);
            return pricesRequests.getPriceForAnyItemAsync(market_hash_name) // fetch from steam market
                .then(price => {
                    return cb(market_hash_name, price);
                })
                .catch(error => { // failed to get price from steam market
                    logs.warnLog(error);
                    return -1;
                })
        });
}

const fetchAndSavePrice = (market_hash_name) => {
    return fetchAndCallback(market_hash_name, addRecord);
}

const fetchAndUpdatePrice = (market_hash_name) => {
    return fetchAndCallback(market_hash_name, updatePrice);
}

/* Fetches the price for provided item from CSAnalyst, if it failes, fetches it from steam market */
const getPrice = (market_hash_name) => {
    // If item in database, return price from db
    return getItemPriceFromDatabase(market_hash_name)
        .catch(err => {
            logs.verboseLog("Fetching the price for new item: ", market_hash_name);
            return fetchAndSavePrice(market_hash_name);
        });
}

module.exports = {
    getAllRecords,
    getAllHashNames,
    addRecord,
    fetchAndSavePrice,
    fetchAndUpdatePrice,
    getPrice,
    updatePrice,
}