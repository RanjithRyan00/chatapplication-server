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
  // const file = req.file;

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
          fileUrl:  file.fileUrl,
        }
      : null,
    chat: chatId,
  };

  // console.log("Message Details:", newMessage);

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
    const file = req.file;
    const { chatId, duration, userData } = req.body;

    const userDataParsed = JSON.parse(userData);

    if (!chatId || !file || !duration || !userData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = {
      sender: userDataParsed.data._id || "6638a9af250d7ea89d186a16",
      voiceNote: {
        url: file.filename,
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

const getAudio = (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname + "\\..\\" + "uploads\\" + fileName);
  // res.set("Content-Type", "audio/wav");
  // res.sendFile(filePath);
  fs.readFile(filePath,(err, data) => {
    if(err){
      console.log('Error reading audio file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    const base64Audio = data.toString('base64');
    res.status(200).json({ audio : base64Audio });
  })
};

module.exports = { allMessages, sendMessage, uploadVoiceNote, getAudio };
