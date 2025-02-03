const Favorite = require("../models/Favorite");
const BaseEstablishment = require("../models/BaseEstablishment");

// Ajouter un établissement aux favoris
exports.addFavorite = async (req, res) => {
  const { establishmentId } = req.body;

  try {
    // Vérifier si l'établissement existe
    const establishment = await BaseEstablishment.findById(establishmentId);
    if (!establishment) {
      return res.status(404).json({ message: "Établissement non trouvé." });
    }

    // Vérifier si l'établissement est déjà dans les favoris
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      establishment: establishmentId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: "Cet établissement est déjà dans vos favoris.",
      });
    }

    // Ajouter aux favoris
    const favorite = new Favorite({
      user: req.user._id,
      establishment: establishmentId,
    });
    await favorite.save();

    res
      .status(201)
      .json({ message: "Établissement ajouté aux favoris.", favorite });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Retirer un établissement des favoris
exports.removeFavorite = async (req, res) => {
  const { establishmentId } = req.params;

  try {
    // Vérifier si l'établissement est dans les favoris
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      establishment: establishmentId,
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ message: "Cet établissement n'est pas dans vos favoris." });
    }

    res.status(200).json({ message: "Établissement retiré des favoris." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Lister les établissements favoris de l'utilisateur
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate(
      "establishment",
      "price name slug location type images"
    );

    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
