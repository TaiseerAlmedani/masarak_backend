require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const authRoutes = require("./routes/auth");
const routeRoutes = require("./routes/routes");
const { authenticateToken, authorizeRole } = require("./middleware/authMiddleware");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Set to true to see SQL queries
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log("Database connected..."))
  .catch(err => console.error("Error connecting to database:", err));

// Import models
const User = require("./models/user")(sequelize);
const Route = require("./models/route")(sequelize);
const Station = require("./models/station")(sequelize);
const RouteStation = require("./models/routeStation")(sequelize);
const Trip = require("./models/trip")(sequelize);
const Rating = require("./models/rating")(sequelize);

// Define associations
User.hasMany(Trip, { foreignKey: "user_id" });
Trip.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Rating, { foreignKey: "user_id" });
Rating.belongsTo(User, { foreignKey: "user_id" });

Route.hasMany(RouteStation, { foreignKey: "route_id" });
RouteStation.belongsTo(Route, { foreignKey: "route_id" });

Station.hasMany(RouteStation, { foreignKey: "station_id" });
RouteStation.belongsTo(Station, { foreignKey: "station_id" });

Trip.belongsTo(Station, { as: "FromStation", foreignKey: "from_station_id" });
Trip.belongsTo(Station, { as: "ToStation", foreignKey: "to_station_id" });

Trip.hasOne(Rating, { foreignKey: "trip_id" });
Rating.belongsTo(Trip, { foreignKey: "trip_id" });

Route.hasMany(Rating, { foreignKey: "route_id" });
Rating.belongsTo(Route, { foreignKey: "route_id" });

// Sync database (create tables if they don't exist)
sequelize.sync({ alter: true })
  .then(() => console.log("Database synced"))
  .catch(err => console.error("Error syncing database:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api/auth", authRoutes(User));
app.use("/api/routes", authenticateToken, routeRoutes(Route, Station, RouteStation, Trip, Rating, sequelize));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

