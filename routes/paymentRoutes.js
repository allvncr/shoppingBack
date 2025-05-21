const express = require("express");
const {
  initierPaiement,
  fedapayWebhook,
} = require("../controllers/paymentController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// ⚠️ On protège l'initiation de paiement (si nécessaire) avec middleware d'authentification
router.post("/initier-paiement", authenticate, initierPaiement);

router.post("/fedapay/webhook", fedapayWebhook);

module.exports = router;
