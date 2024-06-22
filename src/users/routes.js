const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.get("/", controller.getUsers);
router.post("/", controller.addUser);
router.get("/:id", controller.getUserById);

module.exports = router;