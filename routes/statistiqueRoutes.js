const express = require("express");
const {
  getGlobalStats,
  getProprioStats,
} = require("../controllers/statistiqueController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.get("/", authenticate, checkRole("superAdmin", "admin"), getGlobalStats);

router.get("/proprio", authenticate, checkRole("proprio"), getProprioStats);

module.exports = router;
