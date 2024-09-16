//Routes for primary pages

const express = require('express');
const ensureAuthenticated = require('../src/utils/ensure_authentication');

const pagesController = require('../src/pages/controller');
const router = express.Router();

router.get('/', pagesController.renderIndex);

router.get('/market', pagesController.renderMarket);

router.get('/profile', ensureAuthenticated, pagesController.renderProfile);

router.get('/sell', ensureAuthenticated, pagesController.renderSell);

router.get('/stall/me', ensureAuthenticated, pagesController.renderMyStall);

router.get('/stall/:id', pagesController.renderStall);

router.get('/trades', ensureAuthenticated, pagesController.renderTrades);

// TODO 
// router.get('/deposit', ensureAuthenticated, controller.renderDeposit);
// router.get('/withdraw', ensureAuthenticated, controller.renderWithdraw);
// router.get('/offers', ensureAuthenticated, controller.renderOffers);
// router.get('/watchlist', ensureAuthenticated, controller.renderWatchlist)

module.exports = router;