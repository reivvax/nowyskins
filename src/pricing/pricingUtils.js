const pricesRequests = require('./pricesRequests');
const queries = require('./pricesQueries');
const { spawn } = require('child_process');
const pool = require('../../db');

// Helper function to extract the price value from JSON result
const computePrice = (res) => {
    if (!res.lowest_price || !res.median_price)
        return null;
    return (parseFloat(res.lowest_price.substring(1).replace(",",".")) + parseFloat(res.median_price.substring(1).replace(",","."))) / 2; // take the average of median an lowest price for now
}

const addRecord = (market_hash_name, price) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.addRecord, [market_hash_name, price], (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        });
    })
}

const fetchPrice = (url, wear) => {
    return new Promise((resolve, reject) => {
        args = [url, wear];

        let str = ""
        // args.forEach(element => {
        //     str += element + " ";
        // });
        // console.log(str);

        const pythonProcess = spawn('python', ['scrapper.py', ...args]);

        pythonProcess.on('close', (code) => {
            if (code != 0) {
                console.log(`Scrapping script finished with code ${code}`);
                reject(new Error("Failed to execute the script"));
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            data = data.toString();
            if (data.startsWith("Error"))
                console.log(new Error(`Error from price scrapping script: ${data.substring(7)}`));
        });

        pythonProcess.stdout.on('data', (data) => {
            data = data.toString().trim();
            console.log(data);
            resolve(data);
        });
    });
}

const constructLink = (market_hash_name, name) => {
    let res = "";
    if (market_hash_name.startsWith("StatTrak"))
        res += 'stattrak-';
    if (market_hash_name.startsWith("Souvenir"))
        res += 'souvenir-';

    res += name.replace(/ \| | |\(|\)|\./g, "-").replace(/-+/g, "-").toLowerCase();
    return res;
}


const getPrice = (market_hash_name, name, wear) => {
    // If item in database, return price from db
    return new Promise((resolve, reject) => {
        pool.query(queries.getPrice, [market_hash_name], (err, res) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            if (res.rows.length)
                resolve(res.rows[0].price);
            else
                reject(new Error("Item not found")); // no match
        });
    })
    .then(price => { return price; } )
    .catch(async err => { // If not, fetch from cs analyst
        return fetchPrice("https://csgo.steamanalyst.com/skin/" + constructLink(market_hash_name, name), wear)
            .then(price => {
                    if (price != -1)
                        return addRecord(market_hash_name, price)
                            .then(() => { return price; })
                            .catch(err => { console.log("Failed to add price record: ", err); return price })
                    return price;
            })
            .catch(err => {
                console.log(err);
                return -1;
            });

        // return pricesRequests.getPriceForAnyItemAsync(market_hash_name).then(response => {
        //     const price = computePrice(response);
        //     return addRecord(market_hash_name, price)
        //         .then(added => { return price; })
        //         .catch(err => { console.log("Failed to add price record: ", err); return price });
        // }).catch(err => {
        //     console.log(err);
        //     return undefined;
        // });
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