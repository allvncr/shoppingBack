const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // propriétaire d'établissement
      required: true,
    },

    totalEarned: {
      type: Number,
      default: 0, // cumul total gagné (toutes transactions)
    },

    availableBalance: {
      type: Number,
      default: 0, // disponible pour retrait
    },

    pendingBalance: {
      type: Number,
      default: 0, // non disponible pour retrait
    },

    // Historique simplifié
    history: [
      {
        reservation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reservation",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Finance", financeSchema);
