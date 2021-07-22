require("dotenv/config");

const express = require("express");
const server = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const listEndPoints = require("express-list-endpoints");

const http = require("http");
const serverTest = http.createServer(server);

// const socket = require("socket.io");
const { setTimeout } = require("timers");

server.use(express.json());
server.use(cors());

server.use("/user", userRouter);

const port = process.env.PORT || 5000;

console.log(listEndPoints(server));

const io = require("socket.io")(serverTest, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.handshake.auth.name,
    });
  }
  console.log("this are the users", users);

  /*
  this will send to the user newly connected the previous connected users BUT ONLY THE NEWLY USER WILL HAVE THIS:
  the previously connected user will not see the new one.
  */
  io.emit("users", users);

  // Send to the other users connected the updated list
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.handshake.auth.name,
  });

  io.emit("welcome", { msg: "a user connected to the server" });
  // console.log(socket);
  // Braodcasting to the rest of the users connected included the sender
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("someevent", (data) => {
    socket.broadcast.emit("someevent", data);
  });

  socket.on("disconnect", () => {
    socket.emit("a user disconnected");
  });
});

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    serverTest.listen(port, () => {
      console.log(`The server it's running on port ${port}`);
    })
  )
  .catch((err) => console.log(err));
