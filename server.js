const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(express.static("public"));
app.use(cors());

const httpServer = app.listen(process.env.PORT || 8000, () => {
  const port = httpServer.address().port;
  console.log(`Server running on ${port}`);
});
const io = new Server(httpServer);

let allRooms = {};
/*
roomDemoID:{
    owner: "abc",
    joiner: "xyz",
},
*/

io.on("connection", (socket) => {
  console.log("Client Connected: ", socket.id);
  socket.emit("ID", socket.id);

  //CREATE ROOM
  socket.on("create-room", (data) => {
    allRooms[data.roomID] = {
      owner: data.owner,
    };
    socket.join(data.roomID);
  });
  //JOIN ROOM
  socket.on("join-room", (data) => {
    if (allRooms[data.roomID] !== undefined) {
      if (allRooms[data.roomID].joiner === undefined) {
        allRooms[data.roomID].joiner = data.joiner;
        socket.join(data.roomID);

        socket.emit("join-access", {
          valid: true,
          player: "O",
          resp: "Play on!",
        });

        setTimeout(() => {
          io.to(data.roomID).emit("oponent", allRooms[data.roomID]);
        }, 100); //delaying to gove time to set the socket on, inside useEffect (frontend) on page load
      } else {
        console.log("Room Full!");
        socket.emit("join-access", { valid: false, resp: "Room Full!" });
      }
    } else {
      console.log("Invalid Room!");
      socket.emit("join-access", { valid: false, resp: "Invalid Room!" });
    }
  });

  //PLANTING MOVES
  /*
    let movesObj = {
                    arrCopy: JSON.stringify(arrCopy),
                    ifXturn,
                    currStatus,
                    room
                }
    */
  socket.on("moves", (data) => {
    io.to(data.room).emit("new-moves", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client Disconnected: `, socket.id);
  });
});
