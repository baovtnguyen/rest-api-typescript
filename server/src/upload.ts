import { s3Client } from "./s3Client";
import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";

const BUCKET_NAME = "tieubao-bucket";

const fileFilter = (req: any, file: any, cb: FileFilterCallback) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error());
  }
};

export default multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read-write",
    s3: s3Client as any,
    bucket: BUCKET_NAME,
    metadata: (req: any, file: any, cb: any) => {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: (req: any, file: any, cb: any) => {
      cb(
        null,
        new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname,
      );
    },
  }),
});
