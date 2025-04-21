const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // Récupération de l'ID de l'utilisateur depuis le token
    const {
      establishmentId,
      establishmentType,
      reservationStartDate,
      reservationStartTime,
      reservationEndDate,
      reservationEndTime,
      people,
      price,
      menu,
      additionalInfo,
    } = req.body;

    // Vérifier si le panier existe pour cet utilisateur
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Créer un nouveau panier si aucun n'existe
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Ajouter l'élément au panier
    cart.items.push({
      establishment: establishmentId,
      establishmentType,
      reservationStartDate,
      reservationStartTime,
      reservationEndDate,
      reservationEndTime,
      people,
      price,
      menu,
      additionalInfo,
    });

    // Sauvegarder le panier
    await cart.save();

    res
      .status(200)
      .json({ message: "Élément ajouté au panier avec succès", cart });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout au panier",
      error: error.message,
    });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user._id; // Récupération de l'ID utilisateur depuis le token

    // Rechercher le panier de l'utilisateur
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.establishment"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ message: "Aucun panier trouvé pour cet utilisateur" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du panier",
      error: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id; // Récupération de l'ID utilisateur depuis le token
    const { itemId } = req.params; // ID de l'élément à retirer

    // Chercher le panier de l'utilisateur
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res
        .status(404)
        .json({ message: "Aucun panier trouvé pour cet utilisateur" });
    }

    // Vérifier si l'élément existe dans le panier
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "L'élément à retirer n'existe pas dans le panier" });
    }

    // Retirer l'élément du panier
    cart.items.splice(itemIndex, 1);

    // Sauvegarder les modifications
    await cart.save();

    res
      .status(200)
      .json({ message: "Élément retiré du panier avec succès", cart });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'élément",
      error: error.message,
    });
  }
};
