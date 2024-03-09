const { log } = require("console");
const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const server = http.Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 3002;
const connectedUsers = {};

function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("-");
}

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/api/triggerSocketNotify", express.json(), (req, res) => {
  try {
    const { SenderID, recipientId, Message, tempId } = req.body;
    const roomId = generateRoomId(SenderID, recipientId);

    io.in(roomId).emit("receiveMessage", {
      SenderID,
      recipientId,
      Message,
      tempId,
    });

    res.json({ message: "Message send successfully" });
  } catch (err) {
    console.log("Error in triggerSocketNotify : ", err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ userId, friendId }) => {
    const roomId = generateRoomId(userId, friendId);
    socket.join(roomId, () => {
      console.log("Joined a room", roomId);
    });
    connectedUsers[userId] = roomId;
    console.log("connected users is : ", connectedUsers);
  });

  socket.on("initiateAudioCall", (details) => {
    const roomId = generateRoomId(details.callerId, details.recipientId);
    try {
      details.meetingId = uuidv4();
      details.roomId = roomId;
      console.log("Meeting Id is : ", details);
      io.in(roomId).emit("playRingtone", details);
    } catch (err) {
      console.log("Error in initiateAudioCall : ", err);
    }
  });

  socket.on("callAccepted", (details) => {
    console.log("Dtais are : ",details);
    const roomId = generateRoomId(details.callerId, details.recipientId);
    try{
      io.in(roomId).emit("accept", details);
    }catch(err){
      console.log("Error in callAcceptance : ", err);
    }
  })

  socket.on("endCall",(details)=>{
    const roomId = generateRoomId(details.SenderId, details.receiverId);
    try{
      io.in(roomId).emit("cutCall", details);
    }catch(err){
      console.log("Error in callRejection : ",err);
    }
    console.log("Details are end call : ",details);
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected : ", socket.id);
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

server.listen(PORT, async () => {
  console.log("Server is running on PORT: ", PORT);
});
