// src/app.js
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Import des routes
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const medicalTestRoutes = require("./routes/medicalTestRoutes");
const vitalSignRoutes = require("./routes/vitalSignRoutes");
const alertRoutes = require("./routes/alertRoutes");
const teleconsultationRoutes = require("./routes/teleconsultationRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-tests", medicalTestRoutes);
app.use("/api/vital-signs", vitalSignRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/teleconsultations", teleconsultationRoutes);

// Servir frontend Vite
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

module.exports = app;
