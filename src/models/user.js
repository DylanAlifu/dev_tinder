const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (validator.isEmail(value) === false) {
          throw new Error("Email is invalid");
        }
      },
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      min: 18,
    },

    gender: {
      type: String,
      validate(value) {
        if (!["male", "female"].includes(value)) {
          throw new Error("Gender is invalid");
        }
      },
    },

    about: {
      type: String,
      default: "I am new to DevTinder and excited to meet new people!",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
