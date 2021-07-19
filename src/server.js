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

server.use(express.json());
server.use(cors());

server.use("/user", userRouter);

const port = process.env.PORT || 5000;

console.log(listEndPoints(server));

const io = socket(serverTest);

io.on("connection", (socket) => {
  console.log("a user connected");

  // Braodcasting to the rest of the users connected included the sender
  socket.on("msg", (data) => {
    console.log("This is the message you'd sent", data);
    io.emit("msg", data);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
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
