const express = require("express");
const authController = require("../controllers/authController");

module.exports = (User) => {
  const router = express.Router();

  router.post("/register", (req, res) => authController.signup(req, res, User));
  router.post("/login", (req, res) => authController.login(req, res, User));

  return router;
};

