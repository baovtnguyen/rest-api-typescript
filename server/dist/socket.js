"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
let io;
const sk = {
    init: (httpServer) => {
        io = new socket_io_1.Server(httpServer, {
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
exports.default = sk;
