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

const getPrice = (urls, wears) => {
    return new Promise((resolve, reject) => {
        if (urls.length != wears.length)
            reject(new Error("Urls do not match wears"));

        args = []        
        for (let i = 0; i < urls.length; i++) {
            args.push(urls[i]);
            args.push(wears[i]);
        }
        let str = ""
        args.forEach(element => {
            str += element + " ";
        });
        console.log(str);

        const pythonProcess = spawn('python', ['scrapper.py', ...args]);

        pythonProcess.on('close', (code) => {
            console.log(`Scrapping script finished with code ${code}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            reject(new Error(`Error from price scrapping script: ${data}`));
        });

        pythonProcess.stdout.on('data', (data) => {
            data = data.toString();
            console.log(data);
            resolve(data.split(" "));
        });
    });
    
}

// const getPrice = (market_hash_name) => {
//     // If item in database, return price from db
//     return new Promise((resolve, reject) => {
//         pool.query(queries.getPrice, [market_hash_name], (err, res) => {
//             if (err) {
//                 console.log(err);
//                 reject(err);
//             }
//             if (res.rows.length)
//                 resolve(res.rows[0].price);
//             else
//                 reject(new Error("Item not found")); // no match
//         });
//     })
//     .then(price => { return price; } )
//     .catch(err => { // If not, fetch from steam
//         return pricesRequests.getPriceForAnyItemAsync(market_hash_name).then(response => {
//             const price = computePrice(response);
//             return addRecord(market_hash_name, price)
//                 .then(added => { return price; })
//                 .catch(err => { console.log("Failed to add price record: ", err); return price });
//         }).catch(err => {
//             console.log(err);
//             return undefined;
//         });
//     });
// }

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