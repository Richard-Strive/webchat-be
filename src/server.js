require("dotenv/config");

const express = require("express");
const server = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const listEndPoints = require("express-list-endpoints");

const http = require("http");
const serverTest = http.createServer(server);

const socket = require("socket.io");
const { setTimeout } = require("timers");

server.use(express.json());
server.use(cors());

server.use("/user", userRouter);

const port = process.env.PORT || 5000;

console.log(listEndPoints(server));

const io = socket(serverTest);

io.on("connection", (socket) => {
  io.emit("welcome", { msg: "a user connected to the server" });

  // Braodcasting to the rest of the users connected included the sender
  socket.on("chat message", (msg) => {
    console.log("This is the message you'd sent", msg);
    io.emit("chat message", msg);
  });

  socket.on("someevent", (data) => {
    console.log(data);
    io.emit("someevent", data);
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
