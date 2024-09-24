const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

// Create an express application
const app = express();

// Middleware: parse incoming JSON data
app.use(express.json());
// Middleware: parse incoming cookies
app.use(cookieParser());

// POST a new user
app.post("/signup", async (req, res) => {
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
    await user.save();
    res.send("User saved successfully");
    log("User saved successfully");
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

// POST user login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token);

      res.send("User logged in successfully");
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    res.status(400).send("Error logging in user");
  }
});

// GET user profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (error) {
    res.status(400).send("Error fetching user profile");
  }
});

app.post("/sendConnectionRequest", async (req, res) => {
  // sending a connection request
});

connectDB()
  .then(() => {
    console.log("1st: Database connected");

    app.listen(7777, () => {
      console.log("2nd: Server is running, listening on port 7777");
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
