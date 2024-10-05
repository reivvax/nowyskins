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

router.put('/accept/:trade_id', 
    ensureAuthenticated, 
    tradesController.ensureSellerPrivilegedToUpdateTrade, 
    tradesController.acceptTrade
);

router.put('/cancel/:trade_id', 
    ensureAuthenticated, 
    tradesController.ensureSellerPrivilegedToUpdateTrade, 
    tradesController.cancelTrade
);

module.exports = router;