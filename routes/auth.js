const express = require("express");
const {
  register,
  login,
  updateUserInfo,
} = require("../controllers/authController");
const authenticate = require("../middleware/authenticate"); // Middleware d'authentification

const router = express.Router();

// Routes
// Inscription
router.post("/register", register);

// Connexion
router.post("/login", login);

// Mettre à jour les informations utilisateur (nécessite authentification)
router.put("/update", authenticate, updateUserInfo);

module.exports = router;
