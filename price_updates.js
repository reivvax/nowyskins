const pool = require('./db');
const logs = require('./src/utils/logging');
const pricingUtils = require('./src/pricing/pricingUtils');

const variance = 0.05;

const getRandomTime = (baseInterval) => {
    const difference = variance * baseInterval;
    const offset = Math.floor(Math.random() * difference * 2) - difference;
    return baseInterval + offset;
}

const startPriceUpdate = async () => {
    const items = await pricingUtils.getAllRecords();
    const interval = (12 * 60 * 60 * 1000) / items.length;

    let index = 0;

    const updateNextItem = async () => {
        const item = items[index];
        let price = pricingUtils.fetchAndSavePrice(item.market_hash_name);
        
    }

    for ( ; index < items.lenght; index++) {
        const nextInterval = getRandomVariance(interval);
        console.log(`Next update in ${nextInterval / 1000} seconds`);
        setTimeout(updateNextItem, nextInterval);
    }
}

while (true) {
    try {
        startPriceUpdate();
    } catch (err) {
        logs.warnLog(err);
    }
}