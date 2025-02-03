const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Inscription
exports.register = async (req, res) => {
  const { lastname, firstname, email, tel, password, role } = req.body;
  try {
    // Vérifier si l'email est déjà utilisé
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Vérifier si le numéro de téléphone est déjà utilisé
    const telExists = await User.findOne({ tel });
    if (telExists) {
      return res
        .status(400)
        .json({ message: "Numéro de téléphone déjà utilisé" });
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      lastname,
      firstname,
      email: email.toLowerCase(), // Normalisation de l'email
      tel,
      password,
      role: role || "client", // Par défaut, le rôle est "client"
    });

    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Recherche de l'utilisateur par email (insensible à la casse)
    const user = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Inclure le rôle dans le token
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Renvoi des données utilisateur (sans le mot de passe)
    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        tel: user.tel,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mettre à jour les informations utilisateur
exports.updateUserInfo = async (req, res) => {
  const { firstname, lastname, email, tel } = req.body;

  try {
    // Vérifier si un utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier les doublons (email ou téléphone)
    if (email && email.toLowerCase() !== req.user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
    }

    if (tel && tel !== req.user.tel) {
      const telExists = await User.findOne({ tel });
      if (telExists) {
        return res
          .status(400)
          .json({ message: "Numéro de téléphone déjà utilisé" });
      }
    }

    // Mettre à jour les informations
    req.user.firstname = firstname || req.user.firstname;
    req.user.lastname = lastname || req.user.lastname;
    req.user.email = email?.toLowerCase() || req.user.email; // Normalisation de l'email
    req.user.tel = tel || req.user.tel;

    await req.user.save(); // Sauvegarder les modifications

    res.status(200).json({
      message: "Informations mises à jour avec succès",
      user: {
        id: req.user._id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        tel: req.user.tel,
        role: req.user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des informations",
      error: err.message,
    });
  }
};
