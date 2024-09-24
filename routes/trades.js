const tradesController = require('../src/trades/controller');
const listedItemsController = require('../src/listed_items/controller');
const ensureAuthenticated = require('../src/utils/ensure_authentication');

const { Router } = require('express');
const router = Router();

router.post('/new', 
    ensureAuthenticated, 
    tradesController.ensurePrivilegedToCreateTrade, 
    listedItemsController.checkIfListingActive, 
    tradesController.changeListingStatusAndCreateTrade
);

// router.put('/update/:trade_id', ensureAuthenticated, tradesController.updateState);

module.exports = router;