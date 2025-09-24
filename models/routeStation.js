const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RouteStation = sequelize.define("RouteStation", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return RouteStation;
};

