import { Server } from "socket.io";

// Socket.io lives in its own module so controllers can read the `io` instance
// without importing server.js. server.js imports app.js, and app.js pulls in
// the controllers — importing `io` from server.js there created a circular
// dependency (app.js ↔ server.js) that crashed under Jest with
// "Cannot access 'app' before initialization". This module imports neither
// app.js nor server.js, breaking that cycle.
let io = null;

// Create and configure the Socket.io server. Called once from server.js with
// the HTTP server instance.
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected to Socket.io:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected from Socket.io:", socket.id);
    });
  });

  return io;
};

// Returns the initialised io instance, or null when sockets have not been
// started (e.g. during tests). Callers should guard with optional chaining,
// e.g. getIO()?.emit(...).
export const getIO = () => io;
