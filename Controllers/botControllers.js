const { GoogleGenerativeAI } = require("@google/generative-ai");
const botmessagesModel = require("../models/botmessagesModels");

const botController = async (req, res) => {
  try {
    const { input } = req.body;

    const api = process.env.API_KEY;

    const genAI = new GoogleGenerativeAI(api);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContentStream([input]);

    let generatedContent = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      generatedContent += chunkText;
      
    }   
    if(generatedContent){
      const content = {
      question: input,
      answer: generatedContent,
    }
    botmessagesModel.create(content);
    res.status(200).json({ success: true, content });
    }
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, content: "Internal Server Error" });
  }
};

module.exports = botController;
