const mongoose = require("mongoose");
const BaseEstablishment = require("./BaseEstablishment");

const activitySchema = new mongoose.Schema({
  price: {
    type: Number, // Exemple : 5000 (CFA)
    required: true,
  },
  maxParticipants: {
    type: Number, // Nombre maximum de participants
    required: true,
  },
});

const Activity = BaseEstablishment.discriminator("Activité", activitySchema);

module.exports = Activity;
