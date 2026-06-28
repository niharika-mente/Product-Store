import http from "http";
import { io as ioClient } from "socket.io-client";
import { initSocket, getIO } from "../socket.js";

describe("socket.js — Socket.io lifecycle", () => {
  let server;
  let io;

  afterEach(() => {
    if (io) io.close();
    if (server && server.listening) server.close();
    io = null;
  });

  it("getIO() returns null before initialisation", () => {
    // This is the state controllers see under test (no server running), which
    // is why they guard emits with getIO()?.emit(...).
    expect(getIO()).toBeNull();
  });

  it("initSocket() creates an io instance bound to the given server", () => {
    server = http.createServer();
    io = initSocket(server);

    expect(io).toBeDefined();
    expect(typeof io.emit).toBe("function");
    expect(typeof io.on).toBe("function");
  });

  it("getIO() returns the initialised instance after initSocket()", () => {
    server = http.createServer();
    io = initSocket(server);

    expect(getIO()).toBe(io);
  });

  it("handles a real client connect/disconnect lifecycle", async () => {
    server = http.createServer();
    io = initSocket(server);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();

    // Resolves once the server has fully observed the disconnect, ensuring the
    // internal handler runs inside the test (not during teardown).
    const serverSawDisconnect = new Promise((resolve) => {
      io.on("connection", (socket) => {
        socket.on("disconnect", resolve);
      });
    });

    const client = ioClient(`http://localhost:${port}`, { transports: ["websocket"] });
    await new Promise((resolve, reject) => {
      client.on("connect", resolve);
      client.on("connect_error", reject);
    });
    expect(client.connected).toBe(true);

    client.disconnect();
    await serverSawDisconnect;
    expect(client.connected).toBe(false);
  });
});
