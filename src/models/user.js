const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      index: true,
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

    url: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
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

// NOTE: Arrow functions cannot be used here as we need `this`
userSchema.methods.getJWT = async function () {
  const token = await jwt.sign({ _id: this.id }, "dev@tinder$505", {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  return await bcrypt.compare(passwordInputByUser, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
