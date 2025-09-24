const { Op } = require("sequelize");

exports.addRoute = async (req, res, Route, Station, RouteStation) => {
  const { name, description, color, price, active, stations } = req.body;
  try {
    const newRoute = await Route.create({
      name,
      description,
      color,
      price,
      active,
    });

    if (stations && stations.length > 0) {
      for (let i = 0; i < stations.length; i++) {
        const stationData = stations[i];
        let station = await Station.findOne({ where: { name: stationData.name } });
        if (!station) {
          station = await Station.create(stationData);
        }
        await RouteStation.create({
          route_id: newRoute.id,
          station_id: station.id,
          order_index: i,
        });
      }
    }
    res.status(201).json(newRoute);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllRoutes = async (req, res, Route, Station, RouteStation) => {
  try {
    const routes = await Route.findAll({
      include: [
        {
          model: RouteStation,
          include: [Station],
          order: [["order_index", "ASC"]],
        },
      ],
    });
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.suggestRoute = async (req, res, Route, Station, RouteStation, Trip, User, Rating, sequelize) => {
  const { from_station_name, to_station_name } = req.body;
  const userId = req.user.id; // Assuming user ID is available from authenticated token

  try {
    const fromStation = await Station.findOne({ where: { name: from_station_name } });
    const toStation = await Station.findOne({ where: { name: to_station_name } });

    if (!fromStation || !toStation) {
      return res.status(404).json({ message: "One or both stations not found" });
    }

    let suggestedRoutes = [];

    // 1. Try to find a direct route
    const directRoutes = await Route.findAll({
      include: [
        {
          model: RouteStation,
          where: {
            station_id: { [Op.in]: [fromStation.id, toStation.id] },
          },
          attributes: ["station_id", "order_index"],
        },
      ],
      group: ["Route.id"],
      having: sequelize.literal(
        `COUNT(DISTINCT \"RouteStations\".\"station_id\") = 2 AND MIN(\"RouteStations\".\"order_index\") < MAX(\"RouteStations\".\"order_index\")`
      ),
    });

    if (directRoutes.length > 0) {
      for (const route of directRoutes) {
        const routeStations = await RouteStation.findAll({
          where: { route_id: route.id },
          include: [Station],
          order: [["order_index", "ASC"]],
        });
        suggestedRoutes.push({
          type: "direct",
          route: route.name,
          stations: routeStations.map(rs => rs.Station.name),
          price: route.price,
        });
      }
    }

    // 2. If no direct route, try to find a connecting route (one transfer)
    if (suggestedRoutes.length === 0) {
      const routesFromOrigin = await Route.findAll({
        include: [
          {
            model: RouteStation,
            where: { station_id: fromStation.id },
            attributes: ["station_id", "order_index"],
          },
        ],
      });

      const routesToDestination = await Route.findAll({
        include: [
          {
            model: RouteStation,
            where: { station_id: toStation.id },
            attributes: ["station_id", "order_index"],
          },
        ],
      });

      for (const rFrom of routesFromOrigin) {
        const stationsOnFromRoute = await RouteStation.findAll({
          where: { route_id: rFrom.id },
          include: [Station],
          order: [["order_index", "ASC"]],
        });
        const fromStationIndex = stationsOnFromRoute.findIndex(rs => rs.station_id === fromStation.id);

        for (const rTo of routesToDestination) {
          if (rFrom.id === rTo.id) continue; // Skip direct routes already checked

          const stationsOnToRoute = await RouteStation.findAll({
            where: { route_id: rTo.id },
            include: [Station],
            order: [["order_index", "ASC"]],
          });
          const toStationIndex = stationsOnToRoute.findIndex(rs => rs.station_id === toStation.id);

          // Find common stations (transfer points)
          for (const sFrom of stationsOnFromRoute) {
            for (const sTo of stationsOnToRoute) {
              if (sFrom.station_id === sTo.station_id) {
                // Found a common station
                const transferStation = sFrom.Station;
                const transferStationIndexOnFromRoute = sFrom.order_index;
                const transferStationIndexOnToRoute = sTo.order_index;

                // Check if fromStation -> transferStation -> toStation is a valid path
                if (fromStationIndex < transferStationIndexOnFromRoute && transferStationIndexOnToRoute < toStationIndex) {
                  suggestedRoutes.push({
                    type: "transfer",
                    route1: rFrom.name,
                    transfer_station: transferStation.name,
                    route2: rTo.name,
                    price: rFrom.price + rTo.price,
                    route1_stations: stationsOnFromRoute.slice(fromStationIndex, transferStationIndexOnFromRoute + 1).map(rs => rs.Station.name),
                    route2_stations: stationsOnToRoute.slice(transferStationIndexOnToRoute, toStationIndex + 1).map(rs => rs.Station.name),
                  });
                }
              }
            }
          }
        }
      }
    }

    // Save trip history
    await Trip.create({
      user_id: userId,
      from_station_id: fromStation.id,
      to_station_id: toStation.id,
      suggested_routes: suggestedRoutes,
    });

    res.json({ suggestion: suggestedRoutes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.rateRoute = async (req, res, Rating, Trip) => {
  const { trip_id, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const trip = await Trip.findOne({ where: { id: trip_id, user_id: userId } });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or not authorized" });
    }

    const newRating = await Rating.create({
      user_id: userId,
      trip_id: trip.id,
      rating,
      comment,
    });

    // Update the trip with the rating_id
    trip.rating_id = newRating.id;
    await trip.save();

    res.status(201).json(newRating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

