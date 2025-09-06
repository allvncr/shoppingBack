const express = require("express");
const {
  createRestaurant,
  getRestaurants,
  getRestaurantBySlug,
  updateRestaurant,
  deleteRestaurant,
  addDishToMenu,
  removeDishFromMenu,
  updateDishInMenu,
} = require("../controllers/restaurantController");

const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole");
const upload = require("../middlewares/upload");

const router = express.Router();

// Récupérer tous les restaurants
router.get("/restaurants", getRestaurants);

// Récupérer un restaurant par son ID ou slug
router.get("/restaurants/:slug", getRestaurantBySlug);

// Créer un restaurant
router.post(
  "/restaurants",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  upload.array("images", 10), // max 10 images
  createRestaurant
);

// Mettre à jour un restaurant
router.patch(
  "/restaurants/:id",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  updateRestaurant
);

// Supprimer un restaurant
router.delete(
  "/restaurants/:id",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  deleteRestaurant
);

// Ajouter un plat au menu
router.post(
  "/restaurants/:id/menu",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  addDishToMenu
);

// Supprimer un plat du menu
router.delete(
  "/restaurants/:id/menu/:dishId",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  removeDishFromMenu
);

// Mettre à jour un plat du menu
router.patch(
  "/restaurants/:id/menu/:dishId",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  updateDishInMenu
);

module.exports = router;
