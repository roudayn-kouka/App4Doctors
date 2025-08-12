const VitalSign = require("../models/VitalSign");

exports.createVitalSign = async (req, res) => {
  try {
    const vitalSign = await VitalSign.create(req.body);
    res.status(201).json(vitalSign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVitalSigns = async (req, res) => {
  try {
    const vitalSigns = await VitalSign.find()
      .populate("patientId", "fullName age");
    res.json(vitalSigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVitalSignById = async (req, res) => {
  try {
    const vitalSign = await VitalSign.findById(req.params.id)
      .populate("patientId", "fullName age");
    if (!vitalSign) return res.status(404).json({ message: "Constante vitale non trouvée" });
    res.json(vitalSign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVitalSign = async (req, res) => {
  try {
    const updated = await VitalSign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Constante vitale non trouvée" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVitalSign = async (req, res) => {
  try {
    const deleted = await VitalSign.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Constante vitale non trouvée" });
    res.json({ message: "Constante vitale supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
