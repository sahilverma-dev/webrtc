import "colors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  RoomMap,
  ServerToClientEvents,
  SocketData,
  User,
  UserMap,
} from "./interfaces";

const app = express();

const PORT = 5000;

const server = createServer(app);

const io = new Server<
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: "*",
  },
});

const rooms: RoomMap = new Map();
const users: UserMap = new Map();
const userIdToSocketId: Map<string, string> = new Map();

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`.green);

  function handleLeave(user: User) {
    socket.broadcast.emit("leave", { socketId: socket.id, user });
    users.delete(socket.id);
    socket.disconnect();
    console.log(`socket ${socket.id} disconnected`.red);
    socket.emit("allUsers", { users });
  }

  socket.on("allUsers", (data) => {
    console.log(users);
    io.to(data.roomId).emit("allUsers", { users });
  });

  socket.on("join", ({ roomId, user }) => {
    socket.join(roomId);
    socket.broadcast.emit("join", { socketId: socket.id, user });
    console.log(`user ${user?.name} joined on ${roomId}`.green);
    users.set(socket.id, user);
    userIdToSocketId.set(user.id, socket.id);

    const usersInRoom = rooms.get(roomId) || [];
    usersInRoom?.push(user);

    rooms.set(roomId, usersInRoom);
    socket.emit("allUsers", { users });
  });

  socket.on("offer", ({ user, offer }) => {
    socket.broadcast.emit("offer", { offer, user });
  });

  socket.on("answer", ({ user, answer }) => {
    socket.broadcast.emit("answer", { user, answer });
  });

  socket.on("leave", ({ roomId, user }) => {
    socket.leave(roomId);
    if (user) handleLeave(user);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) handleLeave(user);
  });
});

console.clear();

server.listen(PORT, () => {
  console.log("Server is running on port".green, PORT.toString().white);
});
