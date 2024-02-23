const express = require('express');
const router = express.Router();
const BridgeController = require('../../controllers/bridge-controller');

router.post('/connect', BridgeController.bridge);
router.post('/sendPrivateMessage', BridgeController.sendMessage);

module.exports = router;