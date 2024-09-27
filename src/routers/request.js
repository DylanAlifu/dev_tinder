const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.post("/sendConnectionRequest", userAuth, async (req, res) => {
  // sending a connection request
  const user = req.user;

  console.log("Sending a connection request");

  res.send(user.firstName + " sent the connection request!");
});

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // sending a connection request
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];

    // check if the status is valid
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        Message: "Invalid status type: " + status,
      });
    }

    // check if the user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({
        Message: "User not found",
      });
    }

    // check if there is already a connection request
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

    if (existingConnectionRequest) {
      return res.status(400).json({
        Message: "Connection request already exists",
      });
    }

    // create a new connection request object
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      Message:
        req.user.firstName +
        " sent an " +
        status +
        " request to: " +
        toUser.firstName,
      data: data,
    });

    console.log("Sending a connection request");
  } catch (error) {
    res.status(400).send("ERROR: " + error);
  }
});

module.exports = router;
