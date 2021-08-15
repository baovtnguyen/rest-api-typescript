"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const feed_route_1 = __importDefault(require("./routes/feed.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const upload_1 = __importDefault(require("./upload"));
const socket_1 = __importDefault(require("./socket"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = 8080;
const app = express_1.default();
app.use(morgan_1.default("dev"));
app.use(body_parser_1.default.json());
app.use(upload_1.default.single("image"));
// app.use(
// 	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/feed", feed_route_1.default);
app.use("/auth", auth_route_1.default);
// error handling
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});
// Connect to db
mongoose_1.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running at https://localhost:${PORT}`);
    });
    const myIO = socket_1.default.init(server);
    myIO.on("connection", (socket) => {
        console.log("Client connected");
    });
})
    .catch((err) => console.log(err));
