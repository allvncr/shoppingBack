const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const sendEmail = require("../utils/sendEmail");

// Inscription
exports.register = async (req, res) => {
  const {
    lastname,
    firstname,
    email,
    tel,
    password,
    role,
    establishmentTypes,
  } = req.body;

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

    // Vérifier les types d'établissements s'ils sont fournis
    const validTypes = ["Hotel", "Restaurant", "Activité", "Parking"];
    if (establishmentTypes) {
      const isValid =
        Array.isArray(establishmentTypes) &&
        establishmentTypes.every((type) => validTypes.includes(type));

      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Types d'établissements invalides" });
      }
    }

    // Créer et sauvegarder le nouvel utilisateur
    const newUser = new User({
      lastname,
      firstname,
      email: email.toLowerCase(),
      tel,
      password,
      role: role || "client",
      establishmentTypes: establishmentTypes || [],
    });

    await newUser.save();
    console.log("✅ Nouvel utilisateur créé :", newUser.email);

    // Envoi de l'email de bienvenue
    try {
      await sendEmail({
        to: newUser.email,
        subject: "Bienvenue sur Reserv@babi !",
        html: `
          <h2>Bonjour ${firstname},</h2>
          <p>Merci de votre inscription sur notre plateforme. Vous pouvez maintenant réserver vos établissements préférés !</p>
          <p style="color: #444">— L'équipe Reserv@babi</p>
        `,
      });
      console.log("📩 Email de confirmation envoyé à", newUser.email);
    } catch (emailErr) {
      console.error("❌ Échec de l'envoi de l'email :", emailErr.message);
    }

    // Réponse finale
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser._id,
        lastname: newUser.lastname,
        firstname: newUser.firstname,
        email: newUser.email,
        tel: newUser.tel,
        role: newUser.role,
        establishmentTypes: newUser.establishmentTypes,
      },
    });
  } catch (err) {
    console.error("❌ Erreur dans register :", err);
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
        establishmentTypes: user.establishmentTypes || [], // Inclure les types
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

exports.getAllUsers = async (req, res) => {
  try {
    // Vérifier si un utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Récupérer tous les utilisateurs
    const users = await User.find({});

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: err.message,
    });
  }
};

exports.updateUserByID = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, tel, role, establishmentTypes } =
    req.body;

  try {
    // Vérifier si un utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Trouver l'utilisateur par ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier les doublons (email ou téléphone)
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
    }

    if (tel && tel !== user.tel) {
      const telExists = await User.findOne({ tel });
      if (telExists) {
        return res
          .status(400)
          .json({ message: "Numéro de téléphone déjà utilisé" });
      }
    }

    // Vérifier que les types d'établissements sont valides si fournis
    const validTypes = ["Hotel", "Restaurant", "Activité", "Parking"];
    if (establishmentTypes) {
      if (
        !Array.isArray(establishmentTypes) ||
        !establishmentTypes.every((type) => validTypes.includes(type))
      ) {
        return res
          .status(400)
          .json({ message: "Types d'établissements invalides" });
      }
      user.establishmentTypes = establishmentTypes;
    }

    // Mettre à jour les autres informations
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email?.toLowerCase() || user.email;
    user.tel = tel || user.tel;
    user.role = role || user.role;

    await user.save(); // Sauvegarder les modifications

    res.status(200).json({
      message: "Informations mises à jour avec succès",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        tel: user.tel,
        role: user.role,
        establishmentTypes: user.establishmentTypes,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des informations",
      error: err.message,
    });
  }
};

exports.deleteUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier si un utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérifier si l'utilisateur est un administrateur
    if (req.user.role !== "superAdmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Trouver et supprimer l'utilisateur par ID
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur",
      error: err.message,
    });
  }
};
