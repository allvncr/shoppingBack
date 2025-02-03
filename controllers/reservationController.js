const Reservation = require("../models/Reservation");
const Cart = require("../models/Cart");

exports.createReservation = async (req, res) => {
  try {
    const userId = req.user._id; // Récupération de l'ID de l'utilisateur depuis le token

    // Charger le panier de l'utilisateur
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Votre panier est vide." });
    }

    // Créer la réservation
    const reservation = new Reservation({
      user: userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      status: "EnCours",
    });

    // Enregistrer la réservation
    await reservation.save();

    // Vider le panier après la validation
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return res
      .status(201)
      .json({ message: "Réservation validée avec succès.", reservation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await Reservation.find({ user: userId })
      .populate("items.establishment")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reservations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user.id;

    // Vérification de l'existence de la réservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: userId,
    });
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    // Vérifier si la réservation est déjà annulée
    if (reservation.status === "Annulée") {
      return res
        .status(400)
        .json({ message: "La réservation est déjà annulée." });
    }

    // Mise à jour du statut de la réservation
    reservation.status = "Annulée";
    await reservation.save();

    return res
      .status(200)
      .json({ message: "Réservation annulée avec succès.", reservation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
