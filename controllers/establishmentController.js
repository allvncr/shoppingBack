const Activity = require("../models/Activity");
const Restaurant = require("../models/Restaurant");
const Hotel = require("../models/Hotel");
const Parking = require("../models/Parking");

exports.getAllEstablishments = async (req, res) => {
  try {
    const { name, city, minPrice, maxPrice, type } = req.query;

    // Construire le filtre commun
    let commonFilter = {};

    if (name) {
      commonFilter.name = { $regex: name, $options: "i" }; // Recherche insensible à la casse
    }

    if (city) {
      commonFilter["location.city"] = city;
    }

    if (minPrice || maxPrice) {
      commonFilter.price = {};
      if (minPrice) commonFilter.price.$gte = Number(minPrice);
      if (maxPrice) commonFilter.price.$lte = Number(maxPrice);
    }

    // Déterminer les types à récupérer
    const typesToFetch = type
      ? type.split(",") // Si "type" est spécifié, on récupère les types demandés
      : ["activity", "restaurant", "hotel", "parking"]; // Sinon, on récupère tout

    // Préparer les promesses en fonction des types
    const promises = [];

    if (typesToFetch.includes("activity")) {
      promises.push(
        Activity.find(commonFilter, "name slug price location images").sort({
          createdAt: -1,
        })
      );
    }
    if (typesToFetch.includes("restaurant")) {
      promises.push(
        Restaurant.find(commonFilter, "name slug price location images").sort({
          createdAt: -1,
        })
      );
    }
    if (typesToFetch.includes("hotel")) {
      promises.push(
        Hotel.find(commonFilter, "name slug price location images").sort({
          createdAt: -1,
        })
      );
    }
    if (typesToFetch.includes("parking")) {
      promises.push(
        Parking.find(commonFilter, "name slug price location images").sort({
          createdAt: -1,
        })
      );
    }

    // Exécuter les requêtes en parallèle
    const results = await Promise.all(promises);

    // Combiner les résultats
    const establishments = [];

    if (typesToFetch.includes("activity")) {
      establishments.push(
        ...results[typesToFetch.indexOf("activity")].map((activity) => ({
          ...activity.toObject(),
          type: "activity",
        }))
      );
    }
    if (typesToFetch.includes("restaurant")) {
      establishments.push(
        ...results[typesToFetch.indexOf("restaurant")].map((restaurant) => ({
          ...restaurant.toObject(),
          type: "restaurant",
        }))
      );
    }
    if (typesToFetch.includes("hotel")) {
      establishments.push(
        ...results[typesToFetch.indexOf("hotel")].map((hotel) => ({
          ...hotel.toObject(),
          type: "hotel",
        }))
      );
    }
    if (typesToFetch.includes("parking")) {
      establishments.push(
        ...results[typesToFetch.indexOf("parking")].map((parking) => ({
          ...parking.toObject(),
          type: "parking",
        }))
      );
    }

    res.status(200).json({ establishments });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
