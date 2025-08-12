const express = require("express");
const router = express.Router();
const {
  createVitalSign,
  getVitalSigns,
  getVitalSignById,
  updateVitalSign,
  deleteVitalSign
} = require("../controllers/vitalSignController");

router.post("/", createVitalSign);
router.get("/", getVitalSigns);
router.get("/:id", getVitalSignById);
router.put("/:id", updateVitalSign);
router.delete("/:id", deleteVitalSign);

module.exports = router;
