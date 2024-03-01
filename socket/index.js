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
const PORT = process.env.PORT || 3001;
const connectedUsers = {};

function generateRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join("-");
}

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.post("/api/triggerSocketNotify", express.json(), (req,res)=>{
  const {SenderID, recipientId, Message, tempId } = req.body;
  const roomId = generateRoomId(SenderID,recipientId);
  
  io.in(roomId).emit("receiveMessage", {
    SenderID,
    recipientId,
    Message,
    tempId,
  });

  res.json({message: "Message send successfully"});
})

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ userId, friendId }) => {
    const roomId = generateRoomId(userId, friendId);
    socket.join(roomId, () => {
      console.log("Joined a room", roomId);

    });
    connectedUsers[userId] = roomId;
    console.log("connected users is : ", connectedUsers);
  });

  // socket.on("sendMessage", (msg) => {
  //   const { senderId, recipientId, Message } = msg;
  //   const roomId = generateRoomId(senderId, recipientId);
  //   console.log("MEssage is : ", msg);
  //   io.to(roomId).emit("receiveMessage", msg);
  // });

  socket.on("initiateAudioCall", (details) => {
    details.meetingId = uuidv4();
    console.log("Meeting Id is : ", details);
    try {
      io.emit("playRingtone", details);
      console.log("Success");
    } catch (err) {
      console.log("error : ", err);
    }
  });

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
