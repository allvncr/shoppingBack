const Restaurant = require("../models/Restaurant");

exports.migrateRestaurantsToStatutTrue = async (req, res) => {
  try {
    const result = await Restaurant.updateMany({}, { $set: { statut: true } });
    res.status(200).json({
      message: "Migration terminée : tous les statuts sont passés à true.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

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
    const {
      name,
      city,
      minPrice,
      maxPrice,
      cuisineType,
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
    const restaurant = await Restaurant.findOne({ slug }).populate(
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
      (req.user.role !== "superAdmin" || req.user.role !== "admin")
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
  try {
    const { id } = req.params;

    // Vérifier si le restaurant existe
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer
    if (
      req.user.role === "superAdmin" ||
      req.user.role === "admin" ||
      restaurant.createdBy.toString() === req.user._id.toString()
    ) {
      await Restaurant.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ message: "Restaurant supprimé avec succès" });
    } else {
      return res.status(403).json({
        message:
          "Accès refusé, vous n'êtes pas autorisé à supprimer ce restaurant",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.addDishToMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    const { name, price, image } = req.body;

    const newDish = { name, price, image };
    restaurant.menu.push(newDish);

    await restaurant.save();

    res
      .status(200)
      .json({ message: "Plat ajouté au menu", menu: restaurant.menu });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du plat", error });
  }
};

exports.removeDishFromMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    restaurant.menu = restaurant.menu.filter(
      (dish) => dish._id.toString() !== req.params.dishId
    );

    await restaurant.save();

    res
      .status(200)
      .json({ message: "Plat supprimé du menu", menu: restaurant.menu });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du plat", error });
  }
};

exports.updateDishInMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant non trouvé" });
    }

    const dish = restaurant.menu.id(req.params.dishId);
    if (!dish) {
      return res.status(404).json({ message: "Plat non trouvé" });
    }

    const { name, price, image } = req.body;

    if (name) dish.name = name;
    if (price) dish.price = price;
    if (image) dish.image = image;

    await restaurant.save();

    res.status(200).json({ message: "Plat mis à jour", dish });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du plat", error });
  }
};
