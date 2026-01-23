const mongoose = require('mongoose'); 
const houseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  city: String,
  rooms: Number,
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

houseSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("House", houseSchema); 