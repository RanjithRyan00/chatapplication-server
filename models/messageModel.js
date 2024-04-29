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

    file: { type: String},
    // contentType: { type: String },
    // size: { type: Number },
    path: { type: String }, // For storing file paths if using a file system
    // url: { type: String }, // For storing URLs if files are hosted elsewhere

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
    timeStamp: true,
  }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;