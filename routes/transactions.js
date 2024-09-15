const controller = require('../src/trades');
const ensureAuthenticated = require('../src/utils/ensure_authentication');
const { Router } = require('express');
const router = Router();

router.post('/trade', ensureAuthenticated, controller.startTrade());