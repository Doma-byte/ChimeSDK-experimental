const { BrideRepository } = require("../repository/index");

class BridgeService {
  constructor() {
    this.BrideRepository = new BrideRepository();
  }
  async signalBridge(user_id, meetingId) {
    try {
      const meetingData = await this.BrideRepository.bridgeApi(user_id, meetingId);
      return meetingData;
    } catch (err) {
      console.log("Something went wrong in the service layer ");
      throw { err };
    }
  }
}

module.exports = BridgeService;
