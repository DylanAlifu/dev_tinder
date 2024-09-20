const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

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

// POST a new user
app.post("/api/signup", async (req, res) => {
  // create a new instance of the User model in postman body
  //   {
  //     "firstName": "Steph",
  //     "lastName": "Curry",
  //     "email": "scurry@gmail.com",
  //     "password": "scurry@123",
  //     "age": 34,
  //     "gender": "male"
  //   }
  const user = new User(req.body);

  try {
    await user.save();
    res.send("User saved successfully");
    log("User saved successfully");
  } catch (error) {
    res.status(400).send("Error saving user");
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
