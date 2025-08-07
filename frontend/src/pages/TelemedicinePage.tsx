import React, { useState } from 'react';
import AppointmentModal from '../components/AppointmentModal';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Users, 
  MessageSquare, 
  Settings,
  Camera,
  Share,
  Plus,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';

interface TelemedicineCall {
  id: string;
  patientName: string;
  time: string;
  duration: string;
  type: string;
  status: string;
  meetLink?: string;
}

const TelemedicinePage: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [upcomingCalls, setUpcomingCalls] = useState<TelemedicineCall[]>([
    {
      id: '1',
      patientName: 'Emma Thompson',
      time: '10:00 AM',
      duration: '30 min',
      type: 'Suivi',
      status: 'scheduled',
      meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      time: '11:30 AM',
      duration: '45 min',
      type: 'Consultation',
      status: 'scheduled',
      meetLink: 'https://meet.google.com/klm-nopq-rst'
    },
    {
      id: '3',
      patientName: 'Sarah Williams',
      time: '2:00 PM',
      duration: '30 min',
      type: 'Contrôle',
      status: 'pending',
      meetLink: 'https://meet.google.com/uvw-xyza-bcd'
    }
  ]);

  const handleStartCall = (patientId: string) => {
    setSelectedPatient(patientId);
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedPatient(null);
  };

  const handleJoinMeet = (meetLink: string) => {
    window.open(meetLink, '_blank');
  };

  const handleSaveAppointment = (appointmentData: any) => {
    const newCall: TelemedicineCall = {
      id: Date.now().toString(),
      patientName: appointmentData.patientName,
      time: appointmentData.time,
      duration: `${appointmentData.duration} min`,
      type: appointmentData.type,
      status: 'scheduled',
      meetLink: appointmentData.meetLink
    };
    setUpcomingCalls(prev => [...prev, newCall]);
  };

  if (isCallActive) {
    return (
      <div className="h-full bg-gray-900 text-white relative">
        {/* Video Call Interface */}
        <div className="absolute inset-0 flex">
          {/* Main Video */}
          <div className="flex-1 relative">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <p className="text-xl font-semibold">Emma Thompson</p>
                <p className="text-gray-400">Connecté</p>
              </div>
            </div>
            
            {/* Self Video */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {/* Call Info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
              <p className="text-sm font-medium">Session de téléconsultation</p>
              <p className="text-xs text-gray-300">Durée: 05:32</p>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-80 bg-white text-gray-900 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Chat & Notes</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm"><strong>Patient:</strong> J'ai des vertiges depuis quelques jours</p>
                  <p className="text-xs text-gray-500">10:05 AM</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-3">
                  <p className="text-sm"><strong>Dr. Johnson:</strong> Pouvez-vous décrire quand cela se produit?</p>
                  <p className="text-xs text-gray-500">10:06 AM</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tapez un message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button className="bg-primary-600 text-white px-3 py-2 rounded-lg">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-error-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                !isVideoOn ? 'bg-error-600' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>
            <button className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
              <Monitor className="h-6 w-6" />
            </button>
            <button className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
              <Share className="h-6 w-6" />
            </button>
            <button
              onClick={handleEndCall}
              className="w-12 h-12 bg-error-600 hover:bg-error-700 rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Télémédecine</h1>
          <p className="text-gray-600">Consultations virtuelles et soins à distance</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Programmer Appel
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appels du jour</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Video className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-accent-600 mt-1">12</p>
            </div>
            <div className="bg-accent-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-accent-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durée moyenne</p>
              <p className="text-2xl font-bold text-secondary-600 mt-1">25m</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">4.8</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Calls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Appels vidéo programmés</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingCalls.map((call) => (
            <div key={call.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{call.patientName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {call.time}
                      </span>
                      <span>{call.duration}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {call.type}
                      </span>
                    </div>
                    {call.meetLink && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-xs text-secondary-600 bg-secondary-50 px-2 py-1 rounded">
                          <Video className="h-3 w-3" />
                          Google Meet configuré
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600 p-2">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-2">
                    <Settings className="h-5 w-5" />
                  </button>
                  {call.meetLink ? (
                    <button
                      onClick={() => handleJoinMeet(call.meetLink!)}
                      className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Video className="h-4 w-4" />
                      Rejoindre Meet
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCall(call.id)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Video className="h-4 w-4" />
                      Démarrer Appel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sessions récentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">John Davis</h4>
                  <p className="text-sm text-gray-600">Hier, 15:00 • 45 min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
                  Terminé
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Lisa Parker</h4>
                  <p className="text-sm text-gray-600">25 Jan, 10:30 • 30 min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-medium">
                  Terminé
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal for Telemedicine */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

export default TelemedicinePage;