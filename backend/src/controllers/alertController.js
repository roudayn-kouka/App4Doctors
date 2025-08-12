const Alert = require("../models/Alert");

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("doctorId", "fullName specialty")
      .populate("patientId", "fullName age");
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate("doctorId", "fullName specialty")
      .populate("patientId", "fullName age");
    if (!alert) return res.status(404).json({ message: "Alerte non trouvée" });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Alerte non trouvée" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Alerte non trouvée" });
    res.json({ message: "Alerte supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
