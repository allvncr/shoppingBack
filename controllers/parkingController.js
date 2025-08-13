const Parking = require("../models/Parking");

exports.migrateParkingsToStatutTrue = async (req, res) => {
  try {
    const result = await Parking.updateMany({}, { $set: { statut: true } });
    res.status(200).json({
      message: "Migration terminée : tous les statuts sont passés à true.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Créer un parking
exports.createParking = async (req, res) => {
  const {
    name,
    description,
    location,
    images,
    contact,
    pricePerHour,
    openingHours,
    amenities,
  } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const newParking = new Parking({
      name,
      description,
      location,
      images,
      contact,
      pricePerHour,
      openingHours,
      amenities,
      createdBy: req.user._id, // Associer l'utilisateur connecté
    });

    await newParking.save();

    res.status(201).json({
      message: "Parking créé avec succès",
      parking: newParking,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir la liste des parkings avec filtres
exports.getParkings = async (req, res) => {
  try {
    const {
      name,
      city,
      minPrice,
      maxPrice,
      startTime,
      endTime,
      createdBy,
      statut,
    } = req.query;

    let filter = {
      statut: true, // Par défaut, on ne récupère que les parkings actifs
    };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (statut) {
      delete filter.statut;
    }

    // Si un createdBy est fourni dans les paramètres, filtrer par ce propriétaire
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (city) {
      filter["location.city"] = city;
    }

    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    if (startTime || endTime) {
      filter["openingHours.start"] = startTime ? { $lte: startTime } : {};
      filter["openingHours.end"] = endTime ? { $gte: endTime } : {};
    }

    const parkings = await Parking.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstname lastname email");

    res.status(200).json({ parkings });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les détails d’un parking par ID
exports.getParkingBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const parking = await Parking.findOne({ slug }).populate(
      "createdBy",
      "firstname lastname email"
    );

    if (!parking) {
      return res.status(404).json({ message: "Parking non trouvé" });
    }

    res.status(200).json({ parking });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Mettre à jour un parking
exports.updateParking = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({ message: "Parking non trouvé" });
    }

    // Vérifier si l'utilisateur est le propriétaire ou un superAdmin
    if (
      parking.createdBy.toString() !== req.user._id.toString() &&
      (req.user.role !== "superAdmin" || req.user.role !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à modifier ce parking" });
    }

    const updatedData = req.body;
    const updatedParking = await Parking.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.status(200).json({
      message: "Parking mis à jour avec succès",
      parking: updatedParking,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer un parking
exports.deleteParking = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const parking = await Parking.findById(id);

    if (!parking) {
      return res.status(404).json({ message: "Parking non trouvé" });
    }

    // Vérifier si l'utilisateur est le propriétaire ou un superAdmin
    if (
      parking.createdBy.toString() !== req.user._id.toString() &&
      (req.user.role !== "superAdmin" || req.user.role !== "admin")
    ) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à supprimer ce parking" });
    }

    await Parking.findByIdAndDelete(id);

    res.status(200).json({ message: "Parking supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
