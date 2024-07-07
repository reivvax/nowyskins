const { Router } = require('express');
const router = Router();
const controller = require('./controller');

router.get("/", controller.getUsers);
router.post("/", controller.addUser);
router.get("/:id", controller.getUserById);
router.delete("/:id", controller.removeUser);
router.put("/:id", controller.updateEmail);

module.exports = router;