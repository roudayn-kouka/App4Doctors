import React, { useState } from 'react';
import { usePatients } from '../contexts/PatientContext';
import PatientModal from '../components/PatientModal';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  AlertTriangle,
  User,
  Calendar,
  Phone,
  Mail,
  Activity
} from 'lucide-react';

const PatientsPage: React.FC = () => {
  const { patients, setSelectedPatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPatient, setSelectedPatientLocal] = useState(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' ||
                         (filterRisk === 'high' && patient.riskScore > 70) ||
                         (filterRisk === 'medium' && patient.riskScore > 40 && patient.riskScore <= 70) ||
                         (filterRisk === 'low' && patient.riskScore <= 40);
    return matchesSearch && matchesFilter;
  });

  const getRiskColor = (score: number) => {
    if (score > 70) return 'bg-error-100 text-error-800';
    if (score > 40) return 'bg-warning-100 text-warning-800';
    return 'bg-accent-100 text-accent-800';
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return 'Risque Élevé';
    if (score > 40) return 'Risque Moyen';
    return 'Risque Faible';
  };

  const handleAddPatient = () => {
    setSelectedPatientLocal(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatientLocal(patient);
    setModalMode('view');
    setModalOpen(true);
    setSelectedPatient(patient);
  };

  const handleEditPatient = (patient: any) => {
    setSelectedPatientLocal(patient);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPatientLocal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Gérer votre base de données patients</p>
        </div>
        <button 
          onClick={handleAddPatient}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Patient
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les niveaux de risque</option>
              <option value="high">Risque Élevé</option>
              <option value="medium">Risque Moyen</option>
              <option value="low">Risque Faible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.age} ans</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskScore)}`}>
                {getRiskLabel(patient.riskScore)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {patient.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Dernière visite: {patient.lastVisit}
              </div>
            </div>

            {/* Vitals */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tension artérielle</span>
                <span className="font-medium">{patient.vitals.bloodPressure}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fréquence cardiaque</span>
                <span className="font-medium">{patient.vitals.heartRate} bpm</span>
              </div>
            </div>

            {/* Conditions */}
            {patient.conditions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Conditions:</p>
                <div className="flex flex-wrap gap-1">
                  {patient.conditions.map((condition, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-600">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewPatient(patient)}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </button>
              <button 
                onClick={() => handleEditPatient(patient)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
        mode={modalMode}
      />
    </div>
  );
};

export default PatientsPage;