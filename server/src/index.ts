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
const socketToRoom: Map<string, string> = new Map();

io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle user join/leave
  socket.on("join", ({ roomId, user }) => {
    const usersInRoom = rooms.get(roomId) || [];

    usersInRoom.push(user);
    rooms.set(roomId, usersInRoom);
    users.set(socket.id, user);
    socketToRoom.set(socket.id, roomId);

    const usersArray = Array.from(users.entries())
      .map(([peerId, user]) => ({
        peerId,
        user,
      }))
      .filter((user) => user.peerId !== socket.id);

    socket.join(roomId);
    socket.to(roomId).emit("all-users", { users: usersArray });
    socket.to(roomId).emit("join", { roomId, user });

    console.log(`${user?.name} joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      const user = users.get(socket.id);
      if (user) {
        const usersInRoom = rooms.get(roomId) || [];
        usersInRoom.filter((i) => i.id !== user.id);
        rooms.set(roomId, usersInRoom);
        socketToRoom.set(socket.id, roomId);
        socket.to(roomId).emit("leave", { peerId: socket.id, user });
        users.delete(socket.id);
      }
      socket.leave(roomId);
      socket.disconnect();
    }
    socketToRoom.delete(socket.id);
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

  // message on the room
  socket.on("message", ({ roomId, message, userBy }) => {
    socket.to(roomId).emit("message", { message, userBy });
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});
