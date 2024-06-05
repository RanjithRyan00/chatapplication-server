const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModels");
const multer = require("multer");
const path = require("path");

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("reciever")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  const file = req.file;

  if (!chatId || (!content && !file)) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Invalid data" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content || null,
    file: file ? {
      fileName: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      fileUrl: `uploads/${file.filename}`,
    } : null,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await message.populate("reciever").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: ["name", "email"],
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const uploadVoiceNote = expressAsyncHandler(async (req, res) => {
  upload.single("voiceNote")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload failed", error: err.message });
    }

    const file = req.file;
    const { chatId, duration } = req.body;

    if (!chatId || !file || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = {
      sender: req.user._id,
      voiceNote: {
        url: `uploads/${file.filename}`,
        duration: duration,
      },
      chat: chatId,
    };

    try {
      let message = await Message.create(newMessage);

      message = await message.populate("sender", "name pic").execPopulate();
      message = await message.populate("chat").execPopulate();
      message = await message.populate("reciever").execPopulate();
      message = await User.populate(message, {
        path: "chat.users",
        select: ["name", "email"],
      });

      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

module.exports = { allMessages, sendMessage, uploadVoiceNote };
