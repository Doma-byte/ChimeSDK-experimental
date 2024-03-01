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

  async incomingCall(sender_id, receiver_id){
      try{

      }catch(err){
        console.log("Something went wrong in the repository layer");
        throw { err };
      }
  }
  
  async outgoingCall(){

  }

  async sendMessage(msgDetails){
      try{
        return msgDetails;
      }catch(err){
        console.log("Something went wrong in the repository layer");
        throw { err };
      }
  }
  
  async receiveMessage(){

  }
  
}

module.exports = BrideRepository;
