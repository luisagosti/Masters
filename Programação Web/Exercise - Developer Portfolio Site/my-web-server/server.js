require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authenticate = require("./middleware/authMiddleware");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3006', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(logger);

// Test database connection on startup
testConnection();

// Public routes
app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);

// Protected routes
app.use("/dashboard", authenticate, dashboardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});