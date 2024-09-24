const validator = require("validator");

// explicitly validate the user data, checking for missing fields and invalid data
const validateSignUpData = (req) => {
  const { email, password, firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

module.exports = { validateSignUpData };
