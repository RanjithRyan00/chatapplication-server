const mongoose = require("mongoose");

const botmessagesSchema = mongoose.Schema(
    {
        question: {type : String},

        answer: {type : String},
    }
)
const botmessagesModel = mongoose.model("botmessage",botmessagesSchema); 
module.exports = botmessagesModel