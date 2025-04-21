const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
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
          refPath: "items.establishmentType", // Référence dynamique au modèle en fonction du type
        },
        establishmentType: {
          type: String,
          required: true,
          enum: ["Hotel", "Restaurant", "Activité", "Parking"],
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
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware pour calculer automatiquement le prix total
cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price, 0);
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
