const { BridgeService } = require("../services/index");

const bridgeService = new BridgeService();
const bridge = async (req, res) => {
  try {
    const {user_id, meetingId} = req.body;
    const response = await bridgeService.signalBridge(user_id, meetingId);
    return res.status(200).json({
      message: "Successfully send the data",
      error: {},
      data: response,
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      data: {},
      success: false,
      error: err,
      message: "Not able to connect",
    });
  }
};

module.exports = {
  bridge,
};
