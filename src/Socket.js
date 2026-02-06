import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: true
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});
