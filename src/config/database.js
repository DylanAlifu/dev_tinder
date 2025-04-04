const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://Dylandev:pKNV84KPweqvDVsI@dylandev.7d1cg.mongodb.net/dev_tinder"
  );
};

module.exports = connectDB;
