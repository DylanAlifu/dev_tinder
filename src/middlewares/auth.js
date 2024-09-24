const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the cookies in the request
    // validate the token and get the user id from the decoded message

    const { token } = req.cookies;

    if (!token) {
      throw new Error("Invalid token");
    }

    const decodedObj = jwt.verify(token, "dev@tinder$505", {
      expiresIn: "1d",
    });

    const { _id } = decodedObj;
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;

    // Call the next middleware or controller function if the user is authenticated
    // Pass the user object to the next middleware or controller function
    next();
  } catch (error) {
    res.status(401).send("Please authenticate");
  }
};

module.exports = { userAuth };
