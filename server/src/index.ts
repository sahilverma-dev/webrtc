import "colors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { RoomMap, UserMap } from "./interfaces";

const app = express();

const PORT = 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

interface Room {
  [roomId: string]: string[];
}

const rooms: Room = {};

interface Payload {
  target: string;
  candidate?: RTCIceCandidate;
}

io.on("connection", (socket) => {
  socket.on("join room", (roomID: string) => {
    console.log("user joined");

    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }

    const otherUser = rooms[roomID].find((id) => id !== socket.id);
    if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });

  socket.on("offer", (payload: Payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", (payload: Payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", (incoming: Payload) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});
