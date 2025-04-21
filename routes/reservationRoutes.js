const express = require("express");
const {
  createReservation,
  getReservationsByUser,
  cancelReservation,
  confirmReservation,
  getReservationById,
  getAllReservations,
  getReservationsForProprio,
} = require("../controllers/reservationController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Créer une réservation à partir du panier
router.post("/", authenticate, createReservation);

// Obtenir l'historique des réservations d'un utilisateur
router.get("/", authenticate, getReservationsByUser);

// Obtenir les réservations des établissements créés par le propriétaire connecté
router.get("/proprio", authenticate, getReservationsForProprio);

// Annuler une réservation
router.put("/:reservationId/cancel", authenticate, cancelReservation);

// Confirmer une réservation
router.put("/:reservationId/confirm", authenticate, confirmReservation);

// GET /admin/all - Liste complète (superAdmin ou gestion)
router.get(
  "/admin/all",
  authenticate,
  checkRole("superAdmin"),
  getAllReservations
);

module.exports = router;
