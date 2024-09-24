const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Create an express application
const app = express();

// Middleware: parse incoming JSON data
app.use(express.json());
// Middleware: parse incoming cookies
app.use(cookieParser());

// GET all users
app.get("/feed", async (req, res) => {
  // get all users from the database
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(400).send("Error fetching users");
  }
});

// POST user login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Create a jwt token: jwt.sign(payload, secret)
      // payload: data you want to encode in the token
      // secret: a secret string that only the server knows
      const token = jwt.sign({ _id: user._id }, "dev@tinder$505");

      // Add the token to cookies and send it back to the client
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
app.get("/api/profile", async (req, res) => {
  try {
    // first get the token from the cookies in the request (which was set by the server when the user logged in)
    const cookies = req.cookies;
    const { token } = cookies;

    if (!token) {
      throw new Error("Invalid token");
    }

    // verify the token
    const decodedMessage = jwt.verify(token, "dev@tinder$505");

    // get the user id from the decoded message
    const { _id } = decodedMessage;

    res.send("Reading cookie");
  } catch (error) {
    res.status(400).send("Error fetching user profile");
  }
});

// GET user by email
app.get("/api/user", async (req, res) => {
  // get a single user from the database by email
  const userEmail = req.body.email;

  try {
    const user = await User.find({ email: userEmail });
    if (user.length === 0) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send("Error fetching user");
  }
});

// PUT update a user by email
app.put("/api/update", async (req, res) => {
  // update a user by email
  const userEmail = req.body.email;

  try {
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      { firstName: req.body.firstName, lastName: req.body.lastName }
    );

    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("Error updating user");
  }
});

// PUT update a user by id
app.put("/api/user/:userId", async (req, res) => {
  // update a user by id
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["about", "age", "gender"];

    // data object in postman body
    // {
    // _id : 66ece047ae8b81a35377085b
    // age : 64
    // gender : "male"
    // about : "I am new to DevTinder and excited to meet new people!"
    // }

    const updates = Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));

    if (!updates) {
      return res.status(400).send("Update not allowed");
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("Error updating user: " + error.message);
  }
});

// POST a new user
app.post("/api/signup", async (req, res) => {
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

// Delete a user by id
app.delete("/api/delete/:id", async (req, res) => {
  // delete a user by id
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send("Error deleting user");
  }
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
