import React, { useState } from 'react';
import { X, Calendar, Clock, Video, User, Save, Link as LinkIcon } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    time: '',
    type: 'consultation' as 'consultation' | 'follow-up' | 'telemedicine',
    duration: '30',
    notes: '',
    meetLink: ''
  });

  const generateGoogleMeetLink = () => {
    // Simulation d'un lien Google Meet
    const meetId = Math.random().toString(36).substring(2, 15);
    const generatedLink = `https://meet.google.com/${meetId}`;
    setFormData({...formData, meetLink: generatedLink});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointment = {
      id: Date.now().toString(),
      patientId: Math.random().toString(),
      patientName: formData.patientName,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      status: 'scheduled' as const,
      notes: formData.notes,
      duration: parseInt(formData.duration),
      meetLink: formData.type === 'telemedicine' ? formData.meetLink : undefined
    };

    onSave(appointment);
    
    // Reset form
    setFormData({
      patientName: '',
      date: '',
      time: '',
      type: 'consultation',
      duration: '30',
      notes: '',
      meetLink: ''
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Programmer un rendez-vous</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un patient</option>
                <option value="Emma Thompson">Emma Thompson</option>
                <option value="Michael Chen">Michael Chen</option>
                <option value="Sarah Williams">Sarah Williams</option>
                <option value="John Davis">John Davis</option>
                <option value="Lisa Parker">Lisa Parker</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de consultation</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Suivi</option>
                <option value="telemedicine">Téléconsultation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </div>
          </div>

          {formData.type === 'telemedicine' && (
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-5 w-5 text-secondary-600" />
                <span className="font-medium text-secondary-800">Configuration Téléconsultation</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lien Google Meet</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.meetLink}
                        onChange={(e) => setFormData({...formData, meetLink: e.target.value})}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateGoogleMeetLink}
                      className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Générer lien
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-secondary-700">
                  Le lien sera automatiquement envoyé au patient par email avec les détails du rendez-vous.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes additionnelles pour ce rendez-vous..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

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
              Programmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;