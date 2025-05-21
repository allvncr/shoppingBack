const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

// Définir un schéma spécifique pour Parking
const parkingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
});

// Créer le modèle Parking en tant que discriminant
const Parking = BaseEstablishment.discriminator("Parking", parkingSchema);

module.exports = Parking;
