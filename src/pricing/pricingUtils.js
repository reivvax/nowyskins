const pricesRequests = require('./pricesRequests');
const queries = require('./pricesQueries');
const { spawn } = require('child_process');
const pool = require('../../db');
const logs = require('../utils/logging');

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
                logs.debugLog(`Price scrapping script: ${data.substring(7)}`);
        });

        pythonProcess.stdout.on('data', (data) => {
            data = data.toString().trim();
            resolve(data);
        });
    });
}

/* Construct the suffix of CSAnalyst link based on market hash name and ordinary name */
const constructLinkSuffix = (market_hash_name, name) => {
    let res = "";
    if (market_hash_name.startsWith("StatTrak"))
        res += 'stattrak-';
    if (market_hash_name.startsWith("Souvenir"))
        res += 'souvenir-';

    res += name.replace(/ \| | |\(|\)|\./g, "-").replace(/-+/g, "-").toLowerCase();
    return res;
}

const fetchAndSavePrice = (market_hash_name, name, wear) => {
    return fetchPriceFromCSAnalyst("https://csgo.steamanalyst.com/skin/" + constructLinkSuffix(market_hash_name, name), wear)
        .then(price => { // successful fetch from cs analyst
            if (price != -1)
                return addRecord(market_hash_name, price)
            else
                throw new Error(`Failed to fetch price from CSAnalyst for ${market_hash_name}`);
        })
        .catch(err => { // failed to fetch from CSAnalyst
            return pricesRequests.getPriceForAnyItemAsync(market_hash_name) // fetch from steam market
                .then(price => {
                    return addRecord(market_hash_name, price);
                })
                .catch(error => { // failed to get price from steam market
                    logs.warnLog(error);
                    return -1;
                })
        });
}

/* Fetches the price for provided item from CSAnalyst, if it failes, fetches it from steam market */
const getPrice = (market_hash_name, name, wear) => {
    // If item in database, return price from db
    return getItemPriceFromDatabase(market_hash_name)
        .catch(err => {
            return fetchAndSavePrice(market_hash_name, name, wear)
        });
}

const updatePrice = (market_hash_name, price) => {
    return new Promise((resolve, reject) => { 
        pool.query(queries.updatePrice, [market_hash_name, price], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        });
    });
}

module.exports = {
    addRecord,
    getPrice,
    updatePrice,
}