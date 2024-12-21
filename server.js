const { default: mongoose } = require("mongoose");
require("dotenv").config({ path: "./config.env" });
const app = require("./app");

// Connecting to the DB
const DB = process.env.DB_URI;
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to the MongoDB database");
  })
  .catch((err) => {
    console.error("Error connecting to the MongoDB database:", err);
    process.exit(1); // Exit the process with an error code
  });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port 3000");
});
