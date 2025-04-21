const express = require("express");
const {
  register,
  login,
  updateUserInfo,
  getAllUsers,
  updateUserByID,
  deleteUserByID,
} = require("../controllers/authController");
const authenticate = require("../middleware/authenticate"); // Middleware d'authentification
const checkRole = require("../middleware/checkRole"); // Importer le middleware

const router = express.Router();

// Routes
// Inscription
router.post("/register", register);

// Connexion
router.post("/login", login);

// Récupérer tous les utilisateurs (nécessite authentification)
router.get("/users", authenticate, getAllUsers);

// Mettre à jour les informations utilisateur (nécessite authentification)
router.put("/update", authenticate, updateUserInfo);

router.patch(
  "/users/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  updateUserByID
);

router.delete(
  "/users/:id",
  authenticate,
  checkRole("superAdmin", "proprio"),
  deleteUserByID
);

module.exports = router;
