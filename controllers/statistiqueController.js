// controllers/financeController.js
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Hotel = require("../models/Hotel");
const Activity = require("../models/Activity");
const Reservation = require("../models/Reservation");
const Finance = require("../models/Finance");

// Fonction pour récupérer les statistiques globales
exports.getGlobalStats = async (req, res) => {
  try {
    // Compter les clients (rôle "client")
    const clients = await User.countDocuments({ role: "client" }); // Utilisateurs avec le rôle "client"
    const proprios = await User.countDocuments({ role: "proprio" }); // Utilisateurs avec le rôle "proprio"
    // Compter les restaurants
    const restaurants = await Restaurant.countDocuments();
    // Compter les hôtels
    const hotels = await Hotel.countDocuments();
    // Compter les activités
    const activities = await Activity.countDocuments();

    // Récupérer les 2 dernières réservations (exemple)
    const reservationsRaw = await Reservation.find()
      .sort({ createdAt: -1 }) // createdAt car pas de champ date global
      .limit(2)
      .populate("user", "firstname lastname") // Corrigé
      .populate("items.establishment", "name") // Corrigé
      .lean();

    // Mise en forme des réservations
    const reservations = reservationsRaw.map((r, idx) => ({
      id: idx + 1,
      client: r.user ? `${r.user.firstname} ${r.user.lastname}` : "N/A",
      totalPrice: r.totalPrice ?? "N/A",
      date: r.createdAt ?? "N/A",
    }));

    return res.json({
      clients,
      proprios,
      restaurants,
      hotels,
      activities,
      reservations,
    });
  } catch (error) {
    console.error("❌ Erreur getGlobalStats :", error);
    return res.status(500).json({ error: error.message });
  }
};

// Fonction pour récupérer les statistiques d'un proprio connecté
exports.getProprioStats = async (req, res) => {
  try {
    const proprioId = req.user.id;

    // Récupérer la balance réelle depuis le modèle Finance
    const finance = await Finance.findOne({ owner: proprioId }).lean();
    const balance = finance ? finance.totalEarned : 0;

    // Nombre d'établissements créés par ce proprio
    const restaurants = await Restaurant.countDocuments({
      createdBy: proprioId,
    });
    const hotels = await Hotel.countDocuments({ createdBy: proprioId });
    const activities = await Activity.countDocuments({ createdBy: proprioId });

    // Récupérer les IDs de tous ses établissements
    const restoIds = await Restaurant.find({ createdBy: proprioId }).distinct(
      "_id"
    );
    const hotelIds = await Hotel.find({ createdBy: proprioId }).distinct("_id");
    const activityIds = await Activity.find({ createdBy: proprioId }).distinct(
      "_id"
    );
    const allEstablishmentIds = [...restoIds, ...hotelIds, ...activityIds];

    // Réservations liées à ses établissements
    const reservationsRaw = await Reservation.find({
      "items.establishment": { $in: allEstablishmentIds },
    })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("user", "firstname lastname")
      .lean();

    const reservations = reservationsRaw.map((r, idx) => ({
      id: idx + 1,
      client: r.user ? `${r.user.firstname} ${r.user.lastname}` : "N/A",
      totalPrice: r.totalPrice ?? "N/A",
      date: r.createdAt ?? "N/A",
    }));

    return res.json({
      balance,
      restaurants,
      hotels,
      activities,
      reservations,
    });
  } catch (error) {
    console.error("❌ Erreur getProprioStats :", error);
    return res.status(500).json({ error: error.message });
  }
};
