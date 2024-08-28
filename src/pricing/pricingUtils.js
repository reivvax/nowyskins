const pricesRequests = require('./pricesRequests');
const queries = require('./pricesQueries');
const pool = require('../../db');

const callback = (err, res) => {
    if (err)
        return null;
    return res;
}

const addRecord = (type, weapon, skin, wear_name, quality, price) => {
    return pool.query(queries.addRecord, [type, weapon, skin, wear_name, quality, price], (err, res) => {
        if (err)
            throw err;
    });
}

const getPrice = async (type, weapon, skin, wear_name, quality) => {
    // If item in database, return price from db
    var price = await pool.query(queries.getPrice, [weapon, skin, wear_name, quality], (err, res) => {
        if (err) {
            console.log(err);
            return null;
        }
        return res.rows[0];
    });

    let args = [weapon, skin, wear_name, quality, callback];

    // If not, query the steam market
    if (!price) {
        switch (type) {
            case 'weapon':
                price = await pricesRequests.getSinglePrice(...args);
                break;
            case 'knife':
                price = await pricesRequests.getSingleKnifePrice(...args);
                break;
            case 'gloves':
                price = await pricesRequests.getSingleGlovesPrice(...args);
                break;
            case 'case':
                price = await pricesRequests.getSingleCasePrice(...args);
                break;
            case 'operator':
                price = await pricesRequests.getSingleOperatorPrice(...args);
                break;
            case 'sticker':
                price = await pricesRequests.getSingleStickerPrice(...args);
                break;
        }
        if (price) { // Successful fetch
            try {
                await addRecord(type, weapon, skin, wear_name, quality, price);
            } catch (error) {
                console.log("Failed to add price record: ", err);
            }
        }
    }

    return price;
}

const updatePrice = (weapon, skin, wear_name, quality, price) => {
    return pool.query(queries.updatePrice, [weapon, skin, wear_name, quality, price], (err, res) => {
        if (err)
            throw err;
    });
}

module.exports = {
    addRecord,
    getPrice,
    updatePrice,
}