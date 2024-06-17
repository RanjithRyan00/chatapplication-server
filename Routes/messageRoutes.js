const express = require("express");
const {
  allMessages,
  sendMessage,
  uploadVoiceNote
} = require("../Controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect , sendMessage);
router.get('/:chatId', protect, allMessages);
// router.route("/").post(protect, sendMessage);
// router.route("/:chatId").get(protect, allMessages);
router.post("/uploadVoiceNote", uploadVoiceNote);


module.exports = router;
