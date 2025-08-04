const Activity = require("../models/Activity");

// Création d'une activité
exports.createActivity = async (req, res) => {
  const { name, description, location, images, contact, price } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Validation supplémentaire
    if (!name || !location || !contact) {
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
      price,
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
    const { name, city, minPrice, maxPrice, createdBy } = req.query;

    let filter = {};

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (city) {
      filter["location.city"] = city;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy");

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
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée." });
    }

    if (
      (req.user.role !== "superAdmin" || req.user.role !== "admin") &&
      String(activity.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette activité.",
      });
    }

    if (updateData.createdBy) {
      delete updateData.createdBy;
    }

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
    const { id } = req.params;

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }

    if (
      req.user.role === "superAdmin" ||
      req.user.role === "admin" ||
      activity.createdBy.toString() === req.user._id.toString()
    ) {
      await Activity.findByIdAndDelete(id);
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
