const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            let user = await User.findById(decoded.id).select("-password");
            req.user = user;
            // console.log("User Details:", req.user);
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized,token failed");
        }
    }
    // next();
})
module.exports = { protect };