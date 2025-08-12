const express = require("express");
const router = express.Router();
const {
  createTeleconsultation,
  getTeleconsultations,
  getTeleconsultationById,
  updateTeleconsultation,
  deleteTeleconsultation
} = require("../controllers/teleconsultationController");

router.post("/", createTeleconsultation);
router.get("/", getTeleconsultations);
router.get("/:id", getTeleconsultationById);
router.put("/:id", updateTeleconsultation);
router.delete("/:id", deleteTeleconsultation);

module.exports = router;
