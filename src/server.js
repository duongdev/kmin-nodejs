const mongoose = require("mongoose");
const app = require("./app");
const http = require("http");
const config = require("./config");
const { send } = require("process");
// const { initSocket } = require("./socket-io");

const server = http.createServer(app);

module.exports = server;

mongoose
  .connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  });

const io = require("socket.io")(server);

io.on("connect", (socket) => {
  // either with send()
  socket.send("Hello!");

  // socket.id = Object.keys(io.sockets.connected).length;

  // or with emit() and custom event names
  socket.emit("greetings", "Hey!", { ms: "jane" }, Buffer.from([4, 3, 3, 1]));

  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
    // socket.send(Date.now());
    io.sockets.send(Date.now());
    console.log("rooms", socket.rooms);
  });

  socket.on("join-room", (room) => {
    console.log(`${socket.id} join ${room}`);
    socket.join(room);
    io.to(room).emit("member-joined", `${socket.id} join ${room}`);
  });
});

app.post("/:room/message", (req, res) => {
  const message = req.body.message;
  const room = req.params.room;
  console.log({ room, message });
  io.to(room).send(message);
  res.json("ok");
});

module.exports = { server, io };

server.listen(config.serverPort, () => {
  console.log(`Web server is running on port ${config.serverPort}`);
});
