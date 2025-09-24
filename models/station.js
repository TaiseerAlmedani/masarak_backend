const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Station = sequelize.define("Station", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Station;
};

