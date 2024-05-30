const express = require("express");
const botControllers = require("../Controllers/botControllers");

const router = express.Router();

// Define routes
router.post("/generate", botControllers);

module.exports = router;
