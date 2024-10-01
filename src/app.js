const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");

// Import routers
const profileRouter = require("./routers/profile");
const authRouter = require("./routers/auth");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user");

// Create an express application
const app = express();

// Middleware: parse incoming JSON data
app.use(express.json());
// Middleware: parse incoming cookies
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter)

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
