const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors");
var bodyParser = require('body-parser');
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const multer = require("multer");
//Routes 
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const botRoutes = require("./Routes/botRoutes");

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};

//connecting to db.
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use("/chatbot", botRoutes);
// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server= app.listen(PORT, console.log(`Server is Running on port ${PORT}`));

// let api=process.env.API_KEY
//   console.log(api,"api key")

//   const readline = require("readline")

//   const genAI = new GoogleGenerativeAI(api);
//   const userInterface = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
    
//   })
//   userInterface.prompt()
  
//   userInterface.on("line", async input => {
  
//     // For text-only input, use the gemini-pro model
//     const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
//     const result = await model.generateContentStream([input ]);
//     for await(const chunk of result.stream){
//       const chunkText = chunk.text();
//       console.log(chunkText)
//     }  
//   })


//Establishing socket connection on the server with the socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {

  socket.on("setup", (user) => {
    socket.join(user.data._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
  });

  socket.on("newMessage", (newMessageStatus) => {
    const chat = newMessageStatus.chat;
    const sender = newMessageStatus.sender;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id === sender._id) return;
      socket.in(user._id).emit("message received", {sender: sender.name, message: newMessageStatus.content});
    });
  });

  //   socket.on("upload",({data}) => {
  //     fs.writeFile("upload/" + "test.png", data,{encoding:'base64'},() => {} );
  //     socket.emit('uploaded',{buffer: data.toString("base64")});
  // });

  

});
