const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

const activitySchema = new mongoose.Schema({
  duration: {
    type: String, // Exemple : "2 heures", "Journée complète"
    required: true,
  },
  price: {
    type: Number, // Exemple : 5000 (CFA)
    required: true,
  },
  priceDetails: {
    childPrice: {
      type: Number, // Prix pour les enfants, si applicable
      default: null,
    },
    groupDiscount: {
      type: Number, // Pourcentage de réduction pour les groupes, si applicable
      default: null,
    },
  },
  openingHours: {
    start: { type: String, required: true }, // Exemple : "08:00"
    end: { type: String, required: true }, // Exemple : "18:00"
  },
  amenities: {
    type: [String], // Exemple : ["Parking", "Wi-Fi gratuit", "Location de matériel"]
    default: [],
  },
  suitableFor: {
    type: [String], // Exemple : ["Enfants", "Adultes", "Familles"]
    default: [],
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
});

const Activity = BaseEstablishment.discriminator("Activité", activitySchema);

module.exports = Activity;
