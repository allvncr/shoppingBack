const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    transactionId: { type: Number, unique: true },
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
          validate: {
            validator: function (value) {
              if (!value || !this.reservationStartDate) return true;
              return value >= this.reservationStartDate;
            },
            message: "La date de fin doit être postérieure à la date de début.",
          },
        },
        reservationEndTime: {
          type: String,
          required: false,
        },
        people: {
          type: Number,
          required: false,
          min: [1, "Le nombre de personnes doit être au moins 1."],
        },
        price: {
          type: Number,
          required: true,
        },
        additionalInfo: {
          type: String,
          required: false,
        },
        menu: [
          {
            name: {
              type: String,
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              default: 1,
            },
            price: {
              type: Number,
              required: true,
            },
          },
        ],
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
