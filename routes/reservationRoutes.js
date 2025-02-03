const express = require("express");
const {
  createReservation,
  getReservationsByUser,
  cancelReservation,
} = require("../controllers/reservationController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Créer une réservation à partir du panier
router.post("/", authenticate, createReservation);

// Obtenir l'historique des réservations d'un utilisateur
router.get("/", authenticate, getReservationsByUser);

// Annuler une réservation
router.put("/:reservationId/cancel", authenticate, cancelReservation);

module.exports = router;
