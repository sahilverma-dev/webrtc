import "colors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
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

const users: UserMap = new Map();

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
    console.log(`user ${user?.name} joined on ${roomId}`.green);
    users.set(socket.id, user);
    socket.join(roomId);
    socket.emit("allUsers", { users });
    socket.broadcast.emit("join", { socketId: socket.id, user });
  });

  // socket.on("offer", ({ roomId, user, offer }) => {
  //   users.set(socket.id, user);
  //   socket.join(roomId);
  //   socket.broadcast.emit("offer", { user, offer });
  // });

  // socket.on("answer", ({ roomId, user, answer }) => {
  //   users.set(socket.id, user);
  //   socket.join(roomId);
  //   socket.broadcast.emit("answer", { user, answer });
  // });

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
