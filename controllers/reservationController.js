const Reservation = require("../models/Reservation");
const Cart = require("../models/Cart");
const Finance = require("../models/Finance");
const BaseEstablishment = require("../models/BaseEstablishment");
const sendEmail = require("../utils/sendEmail");

exports.createReservation = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Votre panier est vide." });
    }

    // Sauvegarde de la réservation
    const reservation = new Reservation({
      user: userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      status: "EnCours",
    });
    await reservation.save();

    // Récupérer tous les établissements concernés en une requête
    const establishmentIds = [
      ...new Set(cart.items.map((i) => i.establishment.toString())),
    ];
    const establishments = await BaseEstablishment.find({
      _id: { $in: establishmentIds },
    }).populate("createdBy");

    // Map des établissements par id pour lookup rapide
    const estMap = new Map();
    establishments.forEach((e) => estMap.set(e._id.toString(), e));

    // Agréger les montants par propriétaire
    const ownerAggregates = new Map(); // ownerId -> { sum, histories[] }
    for (const item of cart.items) {
      const est = estMap.get(item.establishment.toString());
      if (!est) {
        console.warn("Établissement introuvable pour item :", item);
        continue;
      }

      const owner = est.createdBy;
      if (!owner) {
        console.warn("createdBy manquant pour l'établissement :", est._id);
        continue;
      }

      const ownerId = owner._id ? owner._id.toString() : owner.toString();

      const current = ownerAggregates.get(ownerId) || { sum: 0, histories: [] };
      current.sum += item.price;
      current.histories.push({
        reservation: reservation._id,
        amount: item.price,
      });
      ownerAggregates.set(ownerId, current);
    }

    // Mettre à jour/créer les Finance pour chaque propriétaire (en parallèle)
    const promises = [];
    for (const [ownerId, { sum, histories }] of ownerAggregates) {
      promises.push(
        (async () => {
          let finance = await Finance.findOne({ owner: ownerId });
          if (!finance) finance = new Finance({ owner: ownerId });

          finance.totalEarned = (finance.totalEarned || 0) + sum;
          finance.pendingBalance = (finance.pendingBalance || 0) + sum;
          finance.history.push(...histories);

          await finance.save();
        })()
      );
    }
    await Promise.all(promises);

    // Vider le panier
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    // Envoi email (conserve ta logique)
    // try {
    //   await sendEmail({
    //     to: userEmail,
    //     subject: "Reservation sur Reserv@babi !",
    //     html: `
    //       <p>Bonjour,</p>
    //       <p>Merci d'avoir effectué une réservation sur <strong>Reserv@babi</strong> !</p>
    //       <p>Voici les détails de votre réservation :</p>
    //       <ul>
    //         <li><strong>Nom :</strong> ${req.user.firstname} ${req.user.lastname}</li>
    //         <li><strong>Email :</strong> ${req.user.email}</li>
    //         <li><strong>Total :</strong> ${reservation.totalPrice} €</li>
    //         <li><strong>Statut :</strong> ${reservation.status}</li>
    //       </ul>
    //       <p>Nous vous remercions pour votre confiance.</p>
    //       <p>Cordialement,</p>
    //       <p>L'équipe de Reserv@babi</p>
    //     `,
    //   });
    //   console.log("📩 Email de confirmation envoyé à", userEmail);
    // } catch (emailErr) {
    //   console.error("❌ Échec de l'envoi de l'email :", emailErr.message);
    // }

    return res.status(201).json({
      message: "Réservation validée avec succès.",
      reservation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

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
    // const userId = req.user._id;

    // Vérification de l'existence de la réservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      // user: userId,
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

exports.confirmReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    // const userId = req.user._id;

    // Vérification de l'existence de la réservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      // user: userId,
    });
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    // Vérifier si la réservation est déjà Validée
    if (reservation.status === "Validée") {
      return res
        .status(400)
        .json({ message: "La réservation est déjà validée." });
    }

    // Mise à jour du statut de la réservation
    reservation.status = "Validée";
    await reservation.save();

    return res
      .status(200)
      .json({ message: "Réservation validée avec succès.", reservation });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    // Vérifie que c'est bien un superAdmin
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const reservations = await Reservation.find()
      .populate("user", "firstname lastname email tel")
      .populate("items.establishment", "name type")
      .sort({ createdAt: -1 });

    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id)
      .populate("user", "firstname lastname email")
      .populate("items.establishment", "name type createdBy");

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Si c’est un proprio, on vérifie s’il a créé l’un des établissements
    if (req.user.role === "proprio") {
      const hasAccess = reservation.items.some(
        (item) =>
          item.establishment?.createdBy?.toString() === req.user._id.toString()
      );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ message: "Vous n'avez pas accès à cette réservation" });
      }
    }

    res.status(200).json({ reservation });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les réservations pour les établissements du proprio
exports.getReservationsForProprio = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est proprio
    if (req.user.role !== "proprio") {
      return res
        .status(403)
        .json({ message: "Accès réservé aux propriétaires" });
    }

    // Récupérer les établissements créés par le proprio
    const etablissements = await BaseEstablishment.find({
      createdBy: req.user._id,
    }).select("_id");
    const etablissementIds = etablissements.map((e) => e._id);

    // Rechercher les réservations liées à ces établissements
    const reservations = await Reservation.find({
      "items.establishment": { $in: etablissementIds },
    })
      .populate("user", "firstname lastname email")
      .populate("items.establishment");

    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
