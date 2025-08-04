const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Récupérer le token dans le header
  if (!token) {
    return res.status(401).json({ message: "Accès refusé, token manquant" });
  }

  try {
    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Rechercher l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si le rôle de l'utilisateur est valide
    const validRoles = ["superAdmin", "proprio", "client", "admin"];
    if (!validRoles.includes(user.role)) {
      return res.status(403).json({ message: "Rôle utilisateur invalide" });
    }

    // Attacher l'utilisateur au `req`
    req.user = user;

    // Passer au middleware suivant
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Token invalide ou expiré", error: err.message });
  }
};

module.exports = authenticate;
