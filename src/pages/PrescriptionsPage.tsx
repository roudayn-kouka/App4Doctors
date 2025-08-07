import React, { useState } from 'react';
import PrescriptionModal from '../components/PrescriptionModal';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Send,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Pill,
  Edit
} from 'lucide-react';

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  status: 'sent' | 'pending' | 'filled' | 'expired';
  pharmacy?: string;
  notes?: string;
}

const PrescriptionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Mock prescriptions data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Emma Thompson',
      date: '2024-01-27',
      medications: [
        {
          name: 'Metformine',
          dosage: '500mg',
          frequency: 'Deux fois par jour',
          duration: '30 jours'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Une fois par jour',
          duration: '30 jours'
        }
      ],
      status: 'sent',
      pharmacy: 'Pharmacie Centrale',
      notes: 'Prendre avec de la nourriture'
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Michael Chen',
      date: '2024-01-26',
      medications: [
        {
          name: 'Inhalateur Albuterol',
          dosage: '90mcg',
          frequency: 'Au besoin',
          duration: '30 jours'
        }
      ],
      status: 'filled',
      pharmacy: 'Pharmacie du Centre',
      notes: 'Pour les symptômes d\'asthme'
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Sarah Williams',
      date: '2024-01-25',
      medications: [
        {
          name: 'Ibuprofène',
          dosage: '400mg',
          frequency: 'Toutes les 6 heures',
          duration: '7 jours'
        }
      ],
      status: 'pending',
      notes: 'Pour soulager la douleur'
    }
  ]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-primary-100 text-primary-800';
      case 'pending': return 'bg-warning-100 text-warning-800';
      case 'filled': return 'bg-accent-100 text-accent-800';
      case 'expired': return 'bg-error-100 text-error-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'filled': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Envoyée';
      case 'pending': return 'En attente';
      case 'filled': return 'Délivrée';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const handleCreatePrescription = () => {
    setSelectedPrescription(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSavePrescription = (prescriptionData: any) => {
    if (modalMode === 'create') {
      setPrescriptions(prev => [...prev, prescriptionData]);
    } else if (modalMode === 'edit' && selectedPrescription) {
      setPrescriptions(prev => 
        prev.map(p => p.id === selectedPrescription.id ? prescriptionData : p)
      );
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setPrescriptions(prev => 
      prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordonnances</h1>
          <p className="text-gray-600">Gérer les prescriptions électroniques</p>
        </div>
        <button 
          onClick={handleCreatePrescription}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Ordonnance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ordonnances</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{prescriptions.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {prescriptions.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Délivrées</p>
              <p className="text-2xl font-bold text-accent-600 mt-1">
                {prescriptions.filter(p => p.status === 'filled').length}
              </p>
            </div>
            <div className="bg-accent-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-accent-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ce mois</p>
              <p className="text-2xl font-bold text-secondary-600 mt-1">28</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Pill className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des ordonnances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="sent">Envoyées</option>
              <option value="pending">En attente</option>
              <option value="filled">Délivrées</option>
              <option value="expired">Expirées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ordonnances récentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{prescription.patientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {prescription.date}
                        {prescription.pharmacy && (
                          <>
                            <span>•</span>
                            <span>{prescription.pharmacy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-13 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Pill className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{med.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>{med.dosage} - {med.frequency}</div>
                            <div>Durée: {med.duration}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {prescription.notes && (
                      <div className="text-sm text-gray-600 italic">
                        Note: {prescription.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)} flex items-center gap-1`}>
                    {getStatusIcon(prescription.status)}
                    {getStatusLabel(prescription.status)}
                  </span>
                  <button 
                    onClick={() => handleViewPrescription(prescription)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditPrescription(prescription)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        prescription={selectedPrescription}
        mode={modalMode}
        onSave={handleSavePrescription}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default PrescriptionsPage;