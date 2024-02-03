const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const app = express();
const server = http.Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 3000;
const connectedUsers = {};

app.get("/", (req, res) => {
  res.send("Hello world");
});

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    console.log("Room is ", room);
    socket.join(room, () => {
      console.log("Joined a room");
    });
    connectedUsers[room] = socket.id;
    console.log("connected users is : ", connectedUsers);
  });

  socket.on("sendMessage", (msg) => {
    const { senderId, recipientId, message } = msg;
    console.log("MEssage is : ", msg);
    io.emit("receiveMessage", msg);
  });

  socket.on("initiateAudioCall", details => {
    details.meetingId = uuidv4();
    console.log("Meeting Id is : ",details);
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
