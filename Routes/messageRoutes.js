const express = require("express");
const {
  allMessages,
  sendMessage,
  uploadVoiceNote,
  getAudio
} = require("../Controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const router = express.Router();

router.post("/", protect, sendMessage);
router.get('/:chatId', protect, allMessages);
// router.get('/audio/:filename', getAudio);
router.post("/voice", uploadVoiceNote );
// router.post("/voice", upload.single('voice'), uploadVoiceNote );


module.exports = router;
