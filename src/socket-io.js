const server = require("./app");

const initSocket = () => {
  console.log(server);
  const io = require("socket.io")(server);
  io.on("connect", () => {
    console.log("connected");
  });
};

module.exports = { initSocket };
