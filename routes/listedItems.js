const { Router } = require('express');
const controller = require('../src/listed_items/controller');
const ensureAuthenticated = require('../utils/ensure_authentication');
const router = Router();

router.post("/", ensureAuthenticated, controller.fetchItemData, controller.addItem);
router.delete("/:id", ensureAuthenticated, controller.ensurePrivilegedToDelete, controller.deleteItem);

module.exports = router;