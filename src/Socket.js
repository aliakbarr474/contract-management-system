import { io } from "socket.io-client";

export const socket = io("https://cms-backend-production.up.railway.app", {
  autoConnect: true
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});
