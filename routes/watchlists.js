const { Router } = require('express');
const watchlistsController = require('../src/watchlists/controller');
const ensureAuthenticated = require('../src/utils/ensure_authentication');
const router = Router();

router.post('/', ensureAuthenticated, watchlistsController.addToWatchlist);

router.delete('/', ensureAuthenticated, watchlistsController.removeFromWatchlist);

module.exports = router;