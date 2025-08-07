import React, { useState, useEffect } from 'react';
import { X, Save, Pill, Plus, Trash2, Download, Send } from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medications: Medication[];
  status: 'sent' | 'pending' | 'filled' | 'expired';
  pharmacy?: string;
  notes?: string;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: Prescription | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (prescription: any) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  prescription, 
  mode, 
  onSave,
  onStatusChange 
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    pharmacy: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }] as Medication[]
  });

  const [currentStatus, setCurrentStatus] = useState<string>('pending');

  useEffect(() => {
    if (prescription && (mode === 'edit' || mode === 'view')) {
      setFormData({
        patientName: prescription.patientName,
        pharmacy: prescription.pharmacy || '',
        notes: prescription.notes || '',
        medications: prescription.medications.length > 0 ? prescription.medications : [{ name: '', dosage: '', frequency: '', duration: '' }]
      });
      setCurrentStatus(prescription.status);
    } else if (mode === 'create') {
      setFormData({
        patientName: '',
        pharmacy: '',
        notes: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }]
      });
      setCurrentStatus('pending');
    }
  }, [prescription, mode, isOpen]);

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...formData.medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setFormData({ ...formData, medications: newMedications });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      const newMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({ ...formData, medications: newMedications });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const prescriptionData = {
      id: prescription?.id || Date.now().toString(),
      patientId: prescription?.patientId || Math.random().toString(),
      patientName: formData.patientName,
      date: prescription?.date || new Date().toISOString().split('T')[0],
      medications: formData.medications.filter(med => med.name.trim() !== ''),
      status: currentStatus as 'sent' | 'pending' | 'filled' | 'expired',
      pharmacy: formData.pharmacy,
      notes: formData.notes
    };

    onSave(prescriptionData);
    onClose();
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (prescription && onStatusChange) {
      onStatusChange(prescription.id, newStatus);
    }
  };

  const handleDownload = () => {
    // Créer le contenu de l'ordonnance
    const prescriptionContent = `
ORDONNANCE MÉDICALE

═══════════════════════════════════════════════════════════════

Patient: ${formData.patientName}
Date: ${prescription?.date || new Date().toLocaleDateString('fr-FR')}
Pharmacie: ${formData.pharmacy || 'Non spécifiée'}

═══════════════════════════════════════════════════════════════

MÉDICAMENTS PRESCRITS:

${formData.medications.map((med, index) => 
  `${index + 1}. ${med.name}
     Dosage: ${med.dosage}
     Fréquence: ${med.frequency}
     Durée du traitement: ${med.duration}
     
`).join('')}

═══════════════════════════════════════════════════════════════

INSTRUCTIONS PARTICULIÈRES:
${formData.notes || 'Aucune instruction particulière'}

═══════════════════════════════════════════════════════════════

Dr. Sarah Johnson
Cardiologue
Licence: FR-MD-123456
Signature électronique: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

Cette ordonnance a été générée électroniquement par App4Doctor
Développé par Pixemantic - Plateforme médicale sécurisée
    `;

    // Créer et télécharger le fichier
    const blob = new Blob([prescriptionContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ordonnance_${formData.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Notification de succès
    alert('Ordonnance téléchargée avec succès !');
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Nouvelle Ordonnance' : 
               mode === 'edit' ? 'Modifier Ordonnance' : 'Détails Ordonnance'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && (
              <>
                <button
                  onClick={handleDownload}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Télécharger l'ordonnance"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStatusChange('sent')}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Marquer comme envoyée"
                >
                  <Send className="h-5 w-5" />
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={isReadOnly}
              >
                <option value="">Sélectionner un patient</option>
                <option value="Emma Thompson">Emma Thompson</option>
                <option value="Michael Chen">Michael Chen</option>
                <option value="Sarah Williams">Sarah Williams</option>
                <option value="John Davis">John Davis</option>
                <option value="Lisa Parker">Lisa Parker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacie</label>
              <input
                type="text"
                value={formData.pharmacy}
                onChange={(e) => setFormData({...formData, pharmacy: e.target.value})}
                placeholder="Nom de la pharmacie"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                readOnly={isReadOnly}
              />
            </div>
          </div>

          {/* Status Change for View Mode */}
          {mode === 'view' && prescription && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">Statut de l'ordonnance</label>
              <div className="flex gap-2">
                {['pending', 'sent', 'filled', 'expired'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentStatus === status
                        ? status === 'pending' ? 'bg-warning-600 text-white' :
                          status === 'sent' ? 'bg-primary-600 text-white' :
                          status === 'filled' ? 'bg-accent-600 text-white' :
                          'bg-error-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'pending' ? 'En attente' :
                     status === 'sent' ? 'Envoyée' :
                     status === 'filled' ? 'Délivrée' : 'Expirée'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Médicaments</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addMedication}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.medications.map((medication, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Médicament {index + 1}</h4>
                    {!isReadOnly && formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-error-600 hover:text-error-700 p-1 hover:bg-error-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du médicament</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        placeholder="ex: Paracétamol"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                        readOnly={isReadOnly}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="ex: 500mg"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                        readOnly={isReadOnly}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        placeholder="ex: 2 fois par jour"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                        readOnly={isReadOnly}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        placeholder="ex: 7 jours"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions particulières</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Instructions particulières pour le patient..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              readOnly={isReadOnly}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Créer Ordonnance' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;