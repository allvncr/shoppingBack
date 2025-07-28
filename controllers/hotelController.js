const Hotel = require("../models/Hotel");

// Créer une maison de vacance
exports.createHotel = async (req, res) => {
  const {
    name,
    description,
    location,
    images,
    contact,
    amenities,
    pricePerNight,
    capacity,
  } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const newHotel = new Hotel({
      name,
      description,
      location,
      images,
      contact,
      amenities,
      pricePerNight,
      capacity,
      createdBy: req.user._id,
    });

    await newHotel.save();

    res.status(201).json({
      message: "Maison de vacance créée avec succès",
      hotel: newHotel,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir la liste des maisons de vacances avec filtres
exports.getHotels = async (req, res) => {
  try {
    const { name, city, minPrice, maxPrice, minCapacity } = req.query;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (city) {
      filter["location.city"] = city;
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }

    if (minCapacity) {
      filter.capacity = { $gte: Number(minCapacity) };
    }

    const hotels = await Hotel.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "firstname lastname email");

    res.status(200).json({ hotels });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les détails d'une maison de vacance par slug
exports.getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const hotel = await Hotel.findOne({ slug }).populate(
      "createdBy",
      "firstname lastname email"
    );

    if (!hotel) {
      return res.status(404).json({ message: "Maison de vacance non trouvée" });
    }

    res.status(200).json({ hotel });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier une maison de vacance
exports.updateHotel = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "Maison de vacance non trouvée" });
    }

    if (
      String(hotel.createdBy) !== String(req.user._id) &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cet établissement.",
      });
    }

    Object.assign(hotel, updateData);
    await hotel.save();

    res.status(200).json({
      message: "Maison de vacance mise à jour avec succès.",
      hotel,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer une maison de vacance
exports.deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "Maison de vacance non trouvée" });
    }

    if (
      req.user.role === "superAdmin" ||
      hotel.createdBy.toString() === req.user._id.toString()
    ) {
      await Hotel.findByIdAndDelete(id);
      return res.status(200).json({ message: "Hôtel supprimée avec succès" });
    } else {
      return res.status(403).json({
        message:
          "Accès refusé, vous n'êtes pas autorisé à supprimer cet établissement",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
