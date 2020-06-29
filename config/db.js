const mongoose = require("mongoose");
const config = require("config");

const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log(
      `MongoDB connected at ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    // Console the error and then exist the process
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
