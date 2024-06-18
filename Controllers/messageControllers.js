const expressAsyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");

const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModels");
// const uploadSingleVoiceNote = require("../middleware/uploadMiddleware");

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
  const { content, chatId, file } = req.body;

  if (!chatId || (!content && !file)) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Invalid data" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content || null,
    file: file
      ? {
          fileName: file.fileame || file.fileName,
          fileType: file.mimetype || file.fileType,
          fileSize: file.size || file.fileSize,
          fileUrl: file.fileUrl,
        }
      : null,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("reciever");
    message = await User.populate(message, {
      path: "chat.users",
      select: ["name", "email"],
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(402).json({ message: error.message });
  }
});

const uploadVoiceNote = expressAsyncHandler(async (req, res) => {
  try {
    const { voice, chatId, duration, userData } = req.body;

    const userDataParsed = JSON.parse(userData);

    if (!chatId || !duration || !userData || !voice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // const baseAudio = voice.replace(/^data:audio\/\w+;base64,/, "");

    const newMessage = {
      sender: userDataParsed.data._id,
      voiceNote: {
        url: voice,
        duration: duration,
      },
      chat: chatId,
    };

    try {
      let message = await Message.create(newMessage);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await message.populate("chat.users", "name email");
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      });
      return res.json(message);
    } catch (error) {
      res.status(400).json({ error: "error occurred" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


module.exports = { allMessages, sendMessage, uploadVoiceNote };
