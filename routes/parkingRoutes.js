const express = require("express");
const {
  createParking,
  getParkings,
  getParkingBySlug,
  updateParking,
  deleteParking,
} = require("../controllers/parkingController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole"); // Importer le middleware

const router = express.Router();

// Route pour récupérer les parkings (accessible à tous)
router.get("/parkings", getParkings);

// Route pour récupérer un parking par son ID (accessible à tous)
router.get("/parkings/:slug", getParkingBySlug);

// Route pour créer un parking (accessible uniquement aux superAdmin et proprio)
router.post(
  "/parkings",
  authenticate,
  checkRole("superAdmin", "proprio"),
  createParking
);

// Route pour mettre à jour un parking (accessible uniquement aux superAdmin et proprio)
router.patch(
  "/parkings/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  updateParking
);

// Route pour supprimer un parking (accessible uniquement aux superAdmin et proprio)
router.delete(
  "/parkings/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  deleteParking
);

module.exports = router;
