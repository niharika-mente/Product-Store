import { io } from 'socket.io-client';

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(API, { autoConnect: true });
  }
  return socketInstance;
};
