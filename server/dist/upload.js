"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3Client_1 = require("./s3Client");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const BUCKET_NAME = "tieubao-bucket";
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png") {
        cb(null, true);
    }
    else {
        cb(new Error());
    }
};
exports.default = multer_1.default({
    fileFilter,
    storage: multer_s3_1.default({
        acl: "public-read-write",
        s3: s3Client_1.s3Client,
        bucket: BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: "TESTING_METADATA" });
        },
        key: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
        },
    }),
});
