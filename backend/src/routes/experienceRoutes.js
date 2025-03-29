import express from "express";
import {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  searchExperiences,
} from "../controllers/auth/experienceController.js";
import { protect, authorizeExperienceOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create experience (all users)
router.post("/create", protect, createExperience);

// Get all experiences (public)
router.get("/get", getExperiences);

// Get experience by ID (public)
router.get("/get/:id", getExperienceById);

// Update experience (only the owner)
router.patch("/update/:id", protect, authorizeExperienceOwner, updateExperience);

// Delete experience (only the owner)
router.delete("/delete/:id", protect, authorizeExperienceOwner, deleteExperience);

// Search experiences by destination (public)
router.get("/search/:destination", searchExperiences);

export default router;