const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(3000, () => {
  console.log(`Server started on port ${PORT}!`);
});
