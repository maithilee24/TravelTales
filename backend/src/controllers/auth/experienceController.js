import Experience from "../../models/auth/experienceModel.js";

// Create a new experience
export const createExperience = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    let { destination, itineraryDays, placesCovered, details, totalCost, driverContact, suggestions } = req.body;

    if (!destination || !itineraryDays || !placesCovered || !details || !totalCost) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // Validate details array
    if (!Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ message: "Details array is required and should have at least one entry." });
    }

    for (const detail of details) {
      if (!detail.day || !detail.description || !detail.cost) {
        return res.status(400).json({ message: "Each detail must include day, description, and cost." });
      }
    }

    const experience = new Experience({
      user: req.user.id,
      destination,
      itineraryDays,
      placesCovered,
      details,
      totalCost,  // Fix: Use correct field name
      driverContact,
      suggestions,
    });

    await experience.save();
    res.status(201).json({ message: "Experience shared successfully", experience });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all experiences
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().populate("user", "name photo");
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single experience by ID
export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id).populate("user", "name photo");

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an experience (Only owner can update)
export const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this experience" });
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an experience (Only owner can delete)
export const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this experience" });
    }

    await experience.deleteOne();
    res.status(200).json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search experiences by destination
export const searchExperiences = async (req, res) => {
  try {
    const { destination } = req.params;

    if (!destination) {
      return getExperiences(req, res); // Return all experiences if no destination is provided
    }

    const experiences = await Experience.find({ destination: { $regex: new RegExp(destination, "i") } });

    if (experiences.length === 0) {
      return res.status(404).json({ message: "No experiences found for this destination" });
    }

    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

