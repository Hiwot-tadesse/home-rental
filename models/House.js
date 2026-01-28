// models/House.js
const mongoose = require('mongoose'); 

const houseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  rooms: { type: Number, required: true },
  bathrooms: Number,
  area_sqft: Number,
  images: [String],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "rented"],
    default: "pending"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// ✅ Transform output to match frontend expectations
houseSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString(); // Ensure string ID
    ret.owner_id = ret.owner?.toString(); // ✅ Add owner_id alias
    delete ret._id;
    delete ret.__v;
    delete ret.owner; // Optional: remove "owner" if you only want "owner_id"
  }
});

module.exports = mongoose.model("House", houseSchema);