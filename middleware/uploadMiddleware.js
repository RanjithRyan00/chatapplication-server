const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const uploadMiddleware = async (req, res, next, err) => {
  console.log("formData:", req.body);
  try {
    upload.single("voicenote");
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Upload failed", error: err.message });
  }
};

module.exports = uploadMiddleware;
