import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
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

server.listen(PORT, () =>{
   console.log("\n🚀 ================================");
   console.log(`   Server started at http://localhost:${PORT}`);
   console.log("   ================================\n");
});
