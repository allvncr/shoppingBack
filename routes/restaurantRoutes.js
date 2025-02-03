const express = require("express");
const {
  createRestaurant,
  getRestaurants,
  getRestaurantBySlug,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole"); // Importer le middleware

const router = express.Router();

// Route pour récupérer les restaurants (accessible à tous)
router.get("/restaurants", getRestaurants);

// Route pour récupérer un restaurant par son ID (accessible à tous)
router.get("/restaurants/:id", getRestaurantBySlug);

// Route pour créer un restaurant (accessible uniquement aux superAdmin et proprio)
router.post(
  "/restaurants",
  authenticate,
  checkRole("superAdmin", "proprio"),
  createRestaurant
);

// Route pour mettre à jour un restaurant (accessible uniquement aux superAdmin et proprio)
router.put(
  "/restaurants/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  updateRestaurant
);

// Route pour supprimer un restaurant (accessible uniquement aux superAdmin et proprio)
router.delete(
  "/restaurants/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  deleteRestaurant
);

module.exports = router;
