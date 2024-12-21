const express = require("express");
const userController = require("./../controllers/userController");

const router = express.Router();

router
  .route("/")
  .get(userController.getUsers)
  .delete(userController.deleteUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
