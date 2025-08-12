const MedicalTest = require("../models/MedicalTest");

exports.createMedicalTest = async (req, res) => {
  try {
    const test = await MedicalTest.create(req.body);
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMedicalTests = async (req, res) => {
  try {
    const tests = await MedicalTest.find()
      .populate("patientId", "fullName age");
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMedicalTestById = async (req, res) => {
  try {
    const test = await MedicalTest.findById(req.params.id)
      .populate("patientId", "fullName age");
    if (!test) return res.status(404).json({ message: "Analyse médicale non trouvée" });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicalTest = async (req, res) => {
  try {
    const updated = await MedicalTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Analyse médicale non trouvée" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMedicalTest = async (req, res) => {
  try {
    const deleted = await MedicalTest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Analyse médicale non trouvée" });
    res.json({ message: "Analyse médicale supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
