const { Router } = require('express');
const router = Router();
const controller = require('../src/listed_items/controller');

router.post("/", controller.addItem);

module.exports = router;