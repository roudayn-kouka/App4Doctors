const express = require("express");
const router = express.Router();
const {
  createMedicalTest,
  getMedicalTests,
  getMedicalTestById,
  updateMedicalTest,
  deleteMedicalTest
} = require("../controllers/medicalTestController");

router.post("/", createMedicalTest);
router.get("/", getMedicalTests);
router.get("/:id", getMedicalTestById);
router.put("/:id", updateMedicalTest);
router.delete("/:id", deleteMedicalTest);

module.exports = router;
