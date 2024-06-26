const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    file: {
      fileName: { type: String },
      fileType: { type: String },
      fileSize: { type: String },
      fileUrl: { type: String },
    },
    voiceNote: {
      url: { type: String },
      duration: { type: Number }, // in seconds
    },
    path: { type: String },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: false,
  }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;
