const express = require("express");
const routeController = require("../controllers/routeController");
const { authorizeRole } = require("../middleware/authMiddleware");

module.exports = (Route, Station, RouteStation, Trip, Rating, sequelize) => {
  const router = express.Router();

  router.post("/add", authorizeRole(["admin"]), (req, res) =>
    routeController.addRoute(req, res, Route, Station, RouteStation)
  );
  router.get("/all", (req, res) =>
    routeController.getAllRoutes(req, res, Route, Station, RouteStation)
  );
  router.post("/suggest", (req, res) =>
    routeController.suggestRoute(req, res, Route, Station, RouteStation, Trip, Rating, sequelize)
  );
  router.post("/rate", (req, res) =>
    routeController.rateRoute(req, res, Rating, Trip)
  );

  return router;
};

