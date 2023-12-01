import "colors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { RoomMap, UserMap, User } from "./interfaces";

const app = express();

const PORT = 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users: Map<string, { peerId: string; user: User }> = new Map();
const rooms: Map<string, { peerId: string; user: User }[]> = new Map();
const socketToRoom: Map<string, string> = new Map();

io.on("connection", (socket) => {
  socket.on("join", ({ roomId, user }) => {
    users.set(socket.id, { peerId: socket.id, user });
    socketToRoom.set(socket.id, roomId);

    const usersInRoom = rooms.get(roomId) || [];
    usersInRoom.push({
      peerId: socket.id,
      user,
    });

    rooms.set(roomId, usersInRoom);

    socket.join(roomId);
    io.to(roomId).emit("all-users", { users: usersInRoom });
  });

  // disconnect
  socket.on("disconnect", () => {
    const roomId = socketToRoom.get(socket.id);

    if (roomId) {
      const usersInRoom = rooms.get(roomId);
      const updatedUsers =
        usersInRoom?.filter((u) => u.peerId !== socket.id) || [];

      rooms.set(roomId, updatedUsers);

      // Notify others in the room about the user leaving
      socket
        .to(roomId)
        .emit("leave", { peerId: socket.id, user: users.get(socket.id)?.user });

      // Remove the user from the users map
      users.delete(socket.id);

      // Notify about updated users in the room
      io.to(roomId).emit("all-users", { users: updatedUsers });
      // Leave the room and disconnect
      socket.leave(roomId);
      socket.disconnect();
    }
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});
