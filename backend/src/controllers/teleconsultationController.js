const Teleconsultation = require("../models/Teleconsultation");

exports.createTeleconsultation = async (req, res) => {
  try {
    const teleconsult = await Teleconsultation.create(req.body);
    res.status(201).json(teleconsult);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTeleconsultations = async (req, res) => {
  try {
    const teleconsultations = await Teleconsultation.find()
      .populate("doctorId", "fullName specialty")
      .populate("patientId", "fullName age");
    res.json(teleconsultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeleconsultationById = async (req, res) => {
  try {
    const teleconsult = await Teleconsultation.findById(req.params.id)
      .populate("doctorId", "fullName specialty")
      .populate("patientId", "fullName age");
    if (!teleconsult) return res.status(404).json({ message: "Téléconsultation non trouvée" });
    res.json(teleconsult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeleconsultation = async (req, res) => {
  try {
    const updated = await Teleconsultation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Téléconsultation non trouvée" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTeleconsultation = async (req, res) => {
  try {
    const deleted = await Teleconsultation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Téléconsultation non trouvée" });
    res.json({ message: "Téléconsultation supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
