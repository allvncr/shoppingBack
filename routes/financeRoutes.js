const express = require("express");
const { getAllFinances } = require("../controllers/financeController");
const authenticate = require("../middleware/authenticate");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.get(
  "/",
  authenticate,
  checkRole("superAdmin", "admin", "proprio"),
  getAllFinances
);

module.exports = router;
