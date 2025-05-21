const express = require("express");
const {
  addToCart,
  getUserCart,
  removeFromCart,
} = require("../controllers/cartController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Route pour ajouter un élément au panier
router.post("/", authenticate, addToCart);

// Route pour récupérer le panier de l'utilisateur connecté
router.get("/", authenticate, getUserCart);

// Route pour retirer un élément du panier
router.delete("/:itemId", authenticate, removeFromCart);

module.exports = router;
