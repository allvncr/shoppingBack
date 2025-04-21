const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

const hotelSchema = new mongoose.Schema(
  {
    amenities: [String], // Liste d'équipements (par exemple, Wi-Fi, Piscine, Cuisine équipée)
    pricePerNight: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true, // Nombre de personnes pouvant séjourner
    },
  },
  { timestamps: true }
);

const Hotel = BaseEstablishment.discriminator("Hotel", hotelSchema);

module.exports = Hotel;
