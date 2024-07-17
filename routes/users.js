const { Router } = require('express');
const router = Router();
const controller = require('../src/users/controller');

router.get("/", controller.getUsers);
router.post("/", controller.addUser);
router.get("/:id", controller.getUserById);
router.delete("/:id", controller.removeUser);
router.put("/:id", controller.updateEmail);
router.post("/email/:id", controller.updateEmail);
router.post("/tradelink/:id", controller.updateTradeLink);


router.post("/userinfo/:id", controller.updateEmailTradeLink);

module.exports = router;