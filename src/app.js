const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

app.get("/feed", (req, res) => {
  // get all users from the database
});

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
