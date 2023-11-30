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

const rooms: RoomMap = new Map();
const users: UserMap = new Map();
const userIdToSocketId: Map<string, string> = new Map();
const socketIdToRoom: Map<string, string> = new Map();

io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle join and leave
  socket.on("join", ({ roomId, user }) => {
    socket.join(roomId);
    socket.to(roomId).emit("join", { roomId, user });
    socketIdToRoom.set(socket.id, roomId);
    users.set(socket.id, user);
    console.log(`${user?.name} joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const roomId = socketIdToRoom.get(socket.id);
    const user = users.get(socket.id);
    if (roomId && user) {
      socket.to(roomId).emit("leave", { user });
      socket.leave(roomId);
      users.delete(socket.id);
      socketIdToRoom.delete(socket.id);
      socket.disconnect();
    }
  });

  // Handle WebRTC signaling
  socket.on("offer", ({ offer, roomId, userBy, userTo }) => {
    console.log(
      `got offer from ${userBy.name} to ${userTo.name} and room ${roomId}`
    );
    socket.to(roomId).emit("offer", { offer, userBy });
  });

  socket.on("answer", ({ answer, roomId, userBy, userTo }) => {
    console.log(
      `got answer from ${userBy.name} to ${userTo.name} and room ${roomId}`
    );
    socket.to(roomId).emit("answer", { answer, userBy });
  });

  socket.on("ice-candidate", ({ candidate, roomId, userBy }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, userBy });
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});
