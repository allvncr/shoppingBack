const express = require("express");
const {
  createHotel,
  getHotels,
  getHotelBySlug,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Route pour récupérer les hôtels (accessible à tous)
router.get("/hotels", getHotels);

// Route pour récupérer un hôtel par ID (accessible à tous)
router.get("/hotels/:slug", getHotelBySlug);

// Route pour créer un hôtel (accessible uniquement aux superAdmin et proprio)
router.post(
  "/hotels",
  authenticate,
  checkRole("superAdmin", "proprio"),
  createHotel
);

// Route pour mettre à jour un hôtel (accessible uniquement aux superAdmin et proprio)
router.patch(
  "/hotels/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  updateHotel
);

// Route pour supprimer un hôtel (accessible uniquement aux superAdmin et proprio)
router.delete(
  "/hotels/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  deleteHotel
);

module.exports = router;
