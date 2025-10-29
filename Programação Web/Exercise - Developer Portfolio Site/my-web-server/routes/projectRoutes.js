const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");
const authenticate = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Public routes
router.get("/", projectsController.getAllProjects);
router.get("/:id", projectsController.getProjectById);

// Protected routes (admin only)
router.post("/", authenticate, checkRole('admin'), projectsController.createProject);
router.put("/:id", authenticate, checkRole('admin'), projectsController.updateProject);
router.delete("/:id", authenticate, checkRole('admin'), projectsController.deleteProject);

module.exports = router;