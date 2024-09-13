require('dotenv').config();
const logs = require('./src/utils/logging');
const pricingUtils = require('./src/pricing/pricingUtils');

const variance = 0.1;
const cycleLength = 12 * 60 * 60 * 1000; // 12h

const getRandomTime = (baseInterval) => {
    const difference = variance * baseInterval;
    const offset = Math.floor(Math.random() * difference * 2) - difference;
    return baseInterval + offset;
}

const startPricesUpdate = async () => {
    const items = await pricingUtils.getAllRecords();
    const interval = cycleLength / items.length;

    let index = 0;

    const updateNextItem = async () => {
        if (index >= items.length) {
            logs.verboseLog("Completed one full cycle of price updates.");
            return; // End the cycle once all items are updated
        }

        const item = items[index];
        index++;
        
        const record = await pricingUtils.fetchAndUpdatePrice(item.market_hash_name);
        if (record != -1)
            logs.verboseLog(`Updated the price for ${item.market_hash_name}: ${record.price}`);
        else
            logs.warnLog(`Error updating price for ${item.market_hash_name}`);

        const nextInterval = getRandomTime(interval);
        logs.verboseLog(`Next update in ${(nextInterval / 1000).toFixed(2)} seconds`);

        setTimeout(updateNextItem, nextInterval);
    }

    updateNextItem();
}

const runContinuousUpdates = async () => {
    while (true) {
        console.log("Starting the next price update cycle.");
        try {
            await startPricesUpdate();
        } catch (err) {
            logs.warnLog(`Error during price update cycle, restarting the cycle: ${err}`);
        }

        logs.verboseLog(`Next cycle will start in ${(cycleLength / (60 * 60 * 1000)).toFixed(2)} hours.`);
        await new Promise(resolve => setTimeout(resolve, cycleLength));
    }
}

runContinuousUpdates();