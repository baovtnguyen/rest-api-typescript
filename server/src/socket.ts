import { Server } from "socket.io";
let io: any;

const sk = {
  init: (httpServer: any) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};

export default sk;
