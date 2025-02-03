const Restaurant = require("../models/Restaurant");

// Créer un restaurant
exports.createRestaurant = async (req, res) => {
  const {
    name,
    description,
    location,
    images,
    contact,
    cuisineType,
    openingHours,
    amenities,
  } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const newRestaurant = new Restaurant({
      name,
      description,
      location,
      images,
      contact,
      cuisineType,
      openingHours,
      amenities,
      createdBy: req.user._id, // Associer l'utilisateur connecté
    });

    await newRestaurant.save();

    res.status(201).json({
      message: "Restaurant créé avec succès",
      restaurant: newRestaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir la liste des restaurants avec filtres
exports.getRestaurants = async (req, res) => {
  try {
    const { name, city, minPrice, maxPrice, cuisineType, startTime, endTime } =
      req.query;

    let filter = {};

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

    if (cuisineType) {
      filter.cuisineType = { $regex: cuisineType, $options: "i" };
    }

    if (startTime || endTime) {
      filter["openingHours.start"] = startTime ? { $lte: startTime } : {};
      filter["openingHours.end"] = endTime ? { $gte: endTime } : {};
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstname lastname email");

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les détails d'un restaurant par ID
exports.getRestaurantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne(slug).populate(
      "createdBy",
      "firstname lastname email"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier un restaurant
exports.updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Vérifier si le restaurant existe
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à modifier
    if (
      String(restaurant.createdBy) !== String(req.user._id) &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce restaurant.",
      });
    }

    // Mettre à jour les champs du restaurant
    Object.assign(restaurant, updateData);
    await restaurant.save();

    res.status(200).json({
      message: "Restaurant mis à jour avec succès.",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer un restaurant
exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si le restaurant existe
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer
    if (
      String(restaurant.createdBy) !== String(req.user._id) &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce restaurant.",
      });
    }

    // Supprimer le restaurant
    await restaurant.remove();

    res.status(200).json({
      message: "Restaurant supprimé avec succès.",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
