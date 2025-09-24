const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Trip = sequelize.define("Trip", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    suggested_routes: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  return Trip;
};

