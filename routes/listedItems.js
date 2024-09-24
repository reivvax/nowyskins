const { Router } = require('express');
const listedItemsController = require('../src/listed_items/controller');
const steamItemsController = require('../src/steam_items/controller');
const ensureAuthenticated = require('../src/utils/ensure_authentication');
const router = Router();

router.post("/", 
    ensureAuthenticated, 
    steamItemsController.ensurePrivilegedToAdd, 
    steamItemsController.fetchItemData, 
    listedItemsController.addItem);

router.delete("/:id", 
    ensureAuthenticated, 
    listedItemsController.ensurePrivilegedToDelete, 
    listedItemsController.deleteItem);

module.exports = router;