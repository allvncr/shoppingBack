// controllers/financeController.js
const Finance = require("../models/Finance");

exports.getAllFinances = async (req, res) => {
  try {
    // l'ID du user connecté
    const userId = req.user._id;

    // Récupérer le finance lié à ce user
    const finance = await Finance.findOne({ owner: userId })
      .populate("owner", "firstname lastname email") // optionnel
      .lean();

    if (!finance) {
      return res
        .status(404)
        .json({ message: "Aucune donnée financière trouvée." });
    }

    return res.status(200).json(finance);
  } catch (error) {
    console.error("❌ Erreur getAllFinances :", error);
    return res.status(500).json({ error: error.message });
  }
};
