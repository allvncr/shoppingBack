const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

const restaurantSchema = new mongoose.Schema({
  cuisineType: {
    type: String, // Exemple : "Italienne", "Indienne", "Ivoirienne"
    required: true,
  },
  openingHours: {
    start: { type: String, required: true }, // Exemple : "08:00"
    end: { type: String, required: true }, // Exemple : "22:00"
  },
  ratings: {
    average: {
      type: Number,
      default: 0, // Note moyenne
    },
    count: {
      type: Number,
      default: 0, // Nombre d'avis
    },
  },
  amenities: {
    type: [String], // Exemple : ["Wi-Fi", "Terrasse", "Parking"]
    default: [],
  },
});

const Restaurant = BaseEstablishment.discriminator(
  "Restaurant",
  restaurantSchema
);

module.exports = Restaurant;
