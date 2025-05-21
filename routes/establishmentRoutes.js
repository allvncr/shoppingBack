const express = require("express");
const {
  getAllEstablishments,
} = require("../controllers/establishmentController");
const router = express.Router();

// Route pour récupérer tous les établissements
router.get("/", getAllEstablishments);

module.exports = router;
