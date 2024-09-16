const controller = require('../src/trades/controller');
const ensureAuthenticated = require('../src/utils/ensure_authentication');
const { Router } = require('express');
const router = Router();

router.post('/new', ensureAuthenticated, controller.ensurePrivilegedToCreateTrade, controller.newTrade);

module.exports = router;