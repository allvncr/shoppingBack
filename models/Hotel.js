const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment"); // Si tu utilises un modèle de base

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: String,
      city: String,
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    images: [String], // Liste d'URLs des images
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    roomTypes: [String], // Types de chambres (par exemple, Single, Double, Suite)
    amenities: [String], // Liste d'équipements (par exemple, Wi-Fi, Piscine, Spa)
    pricePerNight: Number, // Prix par nuit
    openingHours: {
      start: String, // Heure d'ouverture
      end: String, // Heure de fermeture
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence à l'utilisateur qui a créé l'hôtel
  },
  { timestamps: true }
);

const Hotel = BaseEstablishment.discriminator("Hotel", hotelSchema); // Si tu as une classe de base (BaseEstablishment)

module.exports = Hotel;
