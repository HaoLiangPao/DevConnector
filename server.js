const express = require("express");
const config = require("config");
const colors = require("colors");
const morgan = require("morgan");

// Customized modules
const connectDB = require("./config/db");

// Initialize the app
const app = express();
// Connect database
connectDB();

// -- Middleware Function
if (config.get("nodeEnvironment") === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res, next) => {
  res.send("API Running");
});

// Define routes
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/profile", require("./routes/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`.yellow.bold);
});
