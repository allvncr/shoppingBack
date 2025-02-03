const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Ajouter un favori
router.post("/", authenticate, addFavorite);

// Retirer un favori
router.delete("/:establishmentId", authenticate, removeFavorite);

// Lister les favoris
router.get("/", authenticate, getFavorites);

module.exports = router;
