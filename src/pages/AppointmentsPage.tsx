import React, { useState } from 'react';
import { usePatients } from '../contexts/PatientContext';
import AppointmentModal from '../components/AppointmentModal';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Video,
  MapPin,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'telemedicine';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  duration?: number;
  meetLink?: string;
}

const AppointmentsPage: React.FC = () => {
  const { patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Mock appointments data with some having meet links
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Emma Thompson',
      date: '2024-01-28',
      time: '09:00',
      type: 'consultation',
      status: 'scheduled',
      notes: 'Suivi du diabète',
      duration: 30
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Michael Chen',
      date: '2024-01-28',
      time: '10:30',
      type: 'telemedicine',
      status: 'scheduled',
      notes: 'Contrôle asthme',
      duration: 45,
      meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Sarah Williams',
      date: '2024-01-28',
      time: '14:00',
      type: 'follow-up',
      status: 'completed',
      notes: 'Bilan de santé général',
      duration: 30
    },
    {
      id: '4',
      patientId: '1',
      patientName: 'Emma Thompson',
      date: '2024-01-28',
      time: '15:30',
      type: 'consultation',
      status: 'cancelled',
      notes: 'Patient a demandé un report',
      duration: 30
    },
  ]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || appointment.type === filterType;
    const matchesDate = appointment.date === selectedDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const handleSaveAppointment = (appointmentData: any) => {
    setAppointments(prev => [...prev, appointmentData]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary-100 text-primary-800';
      case 'completed': return 'bg-accent-100 text-accent-800';
      case 'cancelled': return 'bg-error-100 text-error-800';
      case 'no-show': return 'bg-warning-100 text-warning-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no-show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telemedicine': return <Video className="h-4 w-4 text-secondary-600" />;
      case 'consultation': return <User className="h-4 w-4 text-primary-600" />;
      case 'follow-up': return <MapPin className="h-4 w-4 text-accent-600" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleJoinMeet = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-gray-600">Gérer votre planning de consultations</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Programmer RDV
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des rendez-vous..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Suivi</option>
              <option value="telemedicine">Téléconsultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Rendez-vous pour le {new Date(selectedDate).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun rendez-vous trouvé pour cette date</p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(appointment.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status === 'scheduled' ? 'Programmé' :
                           appointment.status === 'completed' ? 'Terminé' :
                           appointment.status === 'cancelled' ? 'Annulé' : 'Absent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time} ({appointment.duration}min)
                        </div>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(appointment.type)}
                          {appointment.type === 'consultation' ? 'Consultation' :
                           appointment.type === 'follow-up' ? 'Suivi' : 'Téléconsultation'}
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                      )}
                      {appointment.meetLink && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
                            <Video className="h-3 w-3" />
                            Lien Google Meet disponible
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.type === 'telemedicine' && appointment.status === 'scheduled' && appointment.meetLink && (
                      <button 
                        onClick={() => handleJoinMeet(appointment.meetLink!)}
                        className="bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Video className="h-4 w-4" />
                        Rejoindre
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                    {appointment.status === 'scheduled' && (
                      <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                        Commencer
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total du jour</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAppointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-accent-600">
                {filteredAppointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-accent-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Programmés</p>
              <p className="text-2xl font-bold text-primary-600">
                {filteredAppointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Téléconsultations</p>
              <p className="text-2xl font-bold text-secondary-600">
                {filteredAppointments.filter(a => a.type === 'telemedicine').length}
              </p>
            </div>
            <Video className="h-8 w-8 text-secondary-600" />
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default AppointmentsPage;