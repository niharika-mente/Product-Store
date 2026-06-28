import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io is initialised here but lives in socket.js, so controllers reach
// `io` via getIO() without importing this module — breaking the app.js ↔
// server.js circular dependency.
export const io = initSocket(server);

server.listen(PORT, () =>{
   console.log("\n🚀 ================================");
   console.log(`   Server started at http://localhost:${PORT}`);
   console.log("   ================================\n");
});
