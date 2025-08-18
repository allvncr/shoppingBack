const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const establishments = require("./routes/establishmentRoutes");
const activities = require("./routes/activities");
const favorite = require("./routes/favoriteRoutes");
const restaurants = require("./routes/restaurantRoutes");
const hotels = require("./routes/hotelRoutes");
const parking = require("./routes/parkingRoutes");
const finances = require("./routes/financeRoutes");
const statistiques = require("./routes/statistiqueRoutes");
const cart = require("./routes/cartRoutes");
const reservations = require("./routes/reservationRoutes");
const payments = require("./routes/paymentRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/establishments", establishments);
app.use("/api/establishments", activities);
app.use("/api/establishments", restaurants);
app.use("/api/establishments", hotels);
app.use("/api/establishments", parking);
app.use("/api/favorites", favorite);
app.use("/api/finances", finances);
app.use("/api/cart", cart);
app.use("/api/reservations", reservations);
app.use("/api/statistiques", statistiques);
app.use("/api/payment", payments);

// Variables d'environnement
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

// Fonction pour connecter à MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connecté avec succès");
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB", error);
    throw error;
  }
};

// Fonction principale pour démarrer l'application
const start = async () => {
  try {
    await connectDB(); // Connexion à la base de données
    app.listen(port, () => {
      console.log(`Le serveur écoute sur le port ${port}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur", error);
  }
};

// Démarrage de l'application
start();
