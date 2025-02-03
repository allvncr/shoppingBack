const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

// Définir un schéma spécifique pour Parking
const parkingSchema = new mongoose.Schema({
  pricePerHour: {
    type: Number,
    required: true,
  },
  openingHours: {
    start: { type: String, required: true }, // Format : "08:00"
    end: { type: String, required: true },   // Format : "22:00"
  },
  amenities: {
    type: [String], // Exemple : ["Sécurité 24h/24", "Paiement mobile"]
  },
});

// Créer le modèle Parking en tant que discriminant
const Parking = BaseEstablishment.discriminator("Parking", parkingSchema);

module.exports = Parking;
