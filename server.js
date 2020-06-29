const express = require("express");
const config = require("config");
const colors = require("colors");
const morgan = require("morgan");

// Customized modules
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Initialize the app
const app = express();
// Connect database
connectDB();

// -- Middleware Function
// Body parser
app.use(express.json({ extended: false }));
// Dev logger
if (config.get("nodeEnvironment") === "development") {
  app.use(morgan("dev"));
}

// Default response when hitting the root URL
app.get("/", (req, res, next) => {
  res.send("API Running");
});

// Define routes
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/profile", require("./routes/profile"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`.yellow.bold);
});
