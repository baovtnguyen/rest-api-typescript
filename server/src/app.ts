import path from "path";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import express from "express";
import { connect } from "mongoose";

import feedRoutes from "./routes/feed.route";
import authRoutes from "./routes/auth.route";
import upload from "./upload";
import io from "./socket";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI as string;
const PORT = 8080;

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(upload.single("image"));

// app.use(
// 	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// error handling
app.use((error: any, req: any, res: any, next: any) => {
  const status = error.statusCode || 500;
  const message: string = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Connect to db
connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running at https://localhost:${PORT}`);
    });
    const myIO = io.init(server);
    myIO.on("connection", (socket: any) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
