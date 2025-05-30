const express = require("express");
const {
  createActivity,
  getActivities,
  getActivityBySlug,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole"); // Importer le middleware

const router = express.Router();

// Route pour récupérer les activités (accessible à tous)
router.get("/activities", getActivities);

// Route pour récupérer une activité par son slug (accessible à tous)
router.get("/activities/:slug", getActivityBySlug);

// Route pour créer une activité (accessible uniquement aux superAdmin et proprio)
router.post(
  "/activities",
  authenticate,
  checkRole("superAdmin", "proprio"),
  createActivity
);

// Route pour mettre à jour une activité (accessible uniquement aux superAdmin et proprio)
router.patch(
  "/activities/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  updateActivity
);

// Route pour supprimer une activité (accessible uniquement aux superAdmin et proprio)
router.delete(
  "/activities/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  deleteActivity
);

module.exports = router;
