const Hotel = require("../models/Hotel");

// Créer un hôtel
exports.createHotel = async (req, res) => {
  const {
    name,
    description,
    location,
    images,
    contact,
    roomTypes,
    amenities,
    pricePerNight,
    openingHours,
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
      roomTypes,
      amenities,
      pricePerNight,
      openingHours,
      createdBy: req.user._id, // Associer l'utilisateur connecté
    });

    await newHotel.save();

    res.status(201).json({
      message: "Hôtel créé avec succès",
      hotel: newHotel,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir la liste des hôtels avec filtres
exports.getHotels = async (req, res) => {
  try {
    const { name, city, minPrice, maxPrice, roomType, startTime, endTime } =
      req.query;

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

    if (roomType) {
      filter.roomTypes = { $regex: roomType, $options: "i" };
    }

    if (startTime || endTime) {
      filter["openingHours.start"] = startTime ? { $lte: startTime } : {};
      filter["openingHours.end"] = endTime ? { $gte: endTime } : {};
    }

    const hotels = await Hotel.find(filter)
      .sort({ createdAt: -1 }) // Trier par date de création
      .populate("createdBy", "firstname lastname email");

    res.status(200).json({ hotels });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir les détails d'un hôtel par SLug
exports.getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const hotel = await Hotel.findOne({ slug }).populate(
      "createdBy",
      "firstname lastname email"
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hôtel non trouvé" });
    }

    res.status(200).json({ hotel });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Modifier un hôtel
exports.updateHotel = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "Hôtel non trouvé" });
    }

    if (
      String(hotel.createdBy) !== String(req.user._id) &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cet hôtel.",
      });
    }

    Object.assign(hotel, updateData);
    await hotel.save();

    res.status(200).json({
      message: "Hôtel mis à jour avec succès.",
      hotel,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Supprimer un hôtel
exports.deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "Hôtel non trouvé" });
    }

    if (
      String(hotel.createdBy) !== String(req.user._id) &&
      req.user.role !== "superAdmin"
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cet hôtel.",
      });
    }

    await hotel.remove();

    res.status(200).json({
      message: "Hôtel supprimé avec succès.",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
