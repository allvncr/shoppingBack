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
        reservationDate: {
          type: Date,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
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
