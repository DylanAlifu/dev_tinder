const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");

const router = express.Router();

router.post("/signup", async (req, res) => {
  // validation of user data
  try {
    validateSignUpData(req);
  } catch (error) {
    return res.status(400).send(error.message);
  }

  try {
    // encrypt password before saving
    const passwordHash = await bcrypt.hash(req.body.password, 8);

    // create a new instance of the User model with the request body
    const user = new User({
      ...req.body,
      password: passwordHash, // Ensure you're saving the hashed password
    });

    // save the new user
    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User created successfully", data: savedUser });
  } catch (error) {
    // This will only be reached if user.save() fails
    if (!res.headersSent) {
      // check if headers have already been sent
      res.status(400).send(error.message);
    } else {
      console.error("Failed to save user: ", error.message);
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send(user);
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    res.status(400).send("Error logging in user");
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.send("User logged out successfully");
});

module.exports = router;
