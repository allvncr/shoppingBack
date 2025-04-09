const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        establishment: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "BaseEstablishment",
        },
        reservationStartDate: {
          type: Date,
          required: true,
        },
        reservationStartTime: {
          type: String,
          required: false,
        },
        reservationEndDate: {
          type: Date,
          required: false,
        },
        reservationEndTime: {
          type: String,
          required: false,
        },
        people: {
          type: Number,
          required: false,
        },
        price: {
          type: Number,
          required: true,
        },
        additionalInfo: {
          type: String,
          required: false,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["EnCours", "Validée", "Annulée"],
      default: "EnCours",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
