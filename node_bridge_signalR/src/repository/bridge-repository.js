class BrideRepository {
  constructor() {
    this.meetingData = {};
  }
  async bridgeApi(user_id, meetingId) {
    try {
      this.meetingData = {
        user_id,
        meetingId,
      };

      console.log("Received data : ", this.meetingData);
      return this.meetingData;
    } catch (err) {
      console.log("Something went wrong in the repository layer");
      throw { err };
    }
  }
}

module.exports = BrideRepository;
