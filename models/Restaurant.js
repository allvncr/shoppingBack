const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

const DishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // URL de l'image du plat
    required: false,
  },
});

const restaurantSchema = new mongoose.Schema({
  cuisineType: {
    type: String,
    required: false,
  },
  openingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  amenities: {
    type: [String],
    default: [],
  },
  menu: {
    type: [DishSchema],
    default: [],
  },
});

const Restaurant = BaseEstablishment.discriminator(
  "Restaurant",
  restaurantSchema
);

module.exports = Restaurant;
