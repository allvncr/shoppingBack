const mongoose = require("mongoose");
const slugify = require("slugify");

const baseEstablishmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["Hotel", "Restaurant", "Activité", "Parking"],
    },
    images: {
      type: [String],
      default: [],
      validate: [arrayLimit, "Le nombre maximum d'images est 10"],
    },
    contact: {
      phone: {
        type: String,
        required: true,
        match: [/^\+?\d{7,15}$/, "Numéro de téléphone invalide"],
      },
      email: {
        type: String,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Adresse email invalide",
        ],
      },
      website: {
        type: String,
        default: "",
        match: [
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
          "URL du site web invalide",
        ],
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

// Limite pour les images
function arrayLimit(val) {
  return val.length <= 10;
}

// Middleware pour générer le slug
baseEstablishmentSchema.pre("save", async function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });

    // Assurer l'unicité du slug
    const existingSlugCount =
      await mongoose.models.BaseEstablishment.countDocuments({
        slug: new RegExp(`^${this.slug}(-\\d+)?$`),
      });
    if (existingSlugCount > 0) {
      this.slug = `${this.slug}-${existingSlugCount + 1}`;
    }
  }
  next();
});

const BaseEstablishment = mongoose.model(
  "BaseEstablishment",
  baseEstablishmentSchema
);

module.exports = BaseEstablishment;
