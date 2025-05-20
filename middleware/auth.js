const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // Extract Auth Headers from the request headers object

    if (!authHeader) {
      return res.status(401).json({
        err: "You must be logged in",
      });
    }

    const token = authHeader.split(" ")[1]; // Get the Bearer token 
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the user based on the token
    const user = await User.findByPk(decoded.userDetails?.id); // Check user exists in database or not

    if (!user) return res.status(404).json({ err: "User not found" });
    
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(503).json({
      err: "Token is not valid",
    });
  }
};

module.exports = isAuthenticated;