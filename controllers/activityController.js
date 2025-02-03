const Activity = require("../models/Activity");

// Création d'une activité
exports.createActivity = async (req, res) => {
  const {
    name,
    description,
    location,
    images,
    contact,
    duration,
    price,
    priceDetails,
    openingHours,
    amenities,
    suitableFor,
  } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Validation supplémentaire
    if (!name || !description || !location || !contact) {
      return res
        .status(400)
        .json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    const newActivity = new Activity({
      name,
      description,
      location,
      images,
      contact,
      duration,
      price,
      priceDetails,
      openingHours,
      amenities,
      suitableFor,
      createdBy: req.user._id, // Associer l'utilisateur connecté
    });

    await newActivity.save();

    res
      .status(201)
      .json({ message: "Activité créée avec succès", activity: newActivity });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir la liste des activités avec filtres
exports.getActivities = async (req, res) => {
  try {
    const { name, city, minPrice, maxPrice, duration, startTime, endTime } =
      req.query;

    // Construire le filtre dynamique
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Recherche insensible à la casse
    }

    if (city) {
      filter["location.city"] = city;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (duration) {
      filter.duration = duration;
    }

    if (startTime || endTime) {
      filter["openingHours.start"] = startTime ? { $lte: startTime } : {};
      filter["openingHours.end"] = endTime ? { $gte: endTime } : {};
    }

    // Sélectionner uniquement les champs nécessaires
    const activities = await Activity.find(filter)
      .select("id name price location slug images") // Limiter les champs retournés
      .sort({ createdAt: -1 }); // Trier par date de création

    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier une activité
exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Vérifier si l'activité existe
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée." });
    }

    // Vérifier les permissions
    if (
      req.user.role !== "superAdmin" &&
      String(activity.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette activité.",
      });
    }

    // Supprimer le champ `createdBy` des données mises à jour pour éviter les conflits
    if (updateData.createdBy) {
      delete updateData.createdBy;
    }

    // Mettre à jour les champs
    Object.assign(activity, updateData);
    await activity.save();

    res
      .status(200)
      .json({ message: "Activité mise à jour avec succès.", activity });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Suppression d'une activité
exports.deleteActivity = async (req, res) => {
  try {
    const { slug } = req.params;

    // Recherche de l'activité par slug
    const activity = await Activity.findOne({ slug });

    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }

    // Vérifier si l'utilisateur est un superAdmin ou s'il est le proprio de l'activité
    if (
      req.user.role === "superAdmin" ||
      activity.createdBy.toString() === req.user._id.toString()
    ) {
      await activity.remove(); // Supprimer l'activité
      return res
        .status(200)
        .json({ message: "Activité supprimée avec succès" });
    } else {
      return res.status(403).json({
        message:
          "Accès refusé, vous n'êtes pas autorisé à supprimer cette activité",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les détails d'une activité par slug
exports.getActivityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Recherche de l'activité par slug
    const activity = await Activity.findOne({ slug }).populate(
      "createdBy",
      "firstname lastname email"
    );

    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée." });
    }

    res.status(200).json({ activity });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
