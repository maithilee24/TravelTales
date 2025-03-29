import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  destination: { type: String, required: true, trim: true },
  itineraryDays: { type: Number, required: true },
  placesCovered: { type: [String], required: true, default: [], trim: true },
  details: [
    {
      day: { type: Number, required: true },
      description: { type: String, required: true, trim: true },
      cost: { type: Number, required: true },
      driverContact: { type: String, trim: true }
    }
  ],
  totalCost: { type: Number, required: true }, // Renamed for clarity
  driverContact: { type: String, trim: true },
  suggestions: { type: [String], default: [] }, // Changed to an array for multiple suggestions
}, { timestamps: true });

const Experience = mongoose.model("Experience", experienceSchema);
export default Experience;