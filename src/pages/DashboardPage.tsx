import React from 'react';
import { usePatients } from '../contexts/PatientContext';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Clock,
  UserCheck,
  Heart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const DashboardPage: React.FC = () => {
  const { patients } = usePatients();

  const todayAppointments = patients.filter(p => p.nextAppointment).length;
  const highRiskPatients = patients.filter(p => p.riskScore > 70).length;
  const totalPatients = patients.length;

  const vitalsData = [
    { time: '09:00', bloodPressure: 120, heartRate: 75 },
    { time: '12:00', bloodPressure: 125, heartRate: 80 },
    { time: '15:00', bloodPressure: 118, heartRate: 72 },
    { time: '18:00', bloodPressure: 122, heartRate: 78 },
  ];

  const appointmentsData = [
    { day: 'Mon', count: 8 },
    { day: 'Tue', count: 12 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 15 },
    { day: 'Fri', count: 10 },
  ];

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: Users,
      color: 'bg-primary-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: 'bg-secondary-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'High Risk Patients',
      value: highRiskPatients,
      icon: AlertTriangle,
      color: 'bg-warning-500',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Consultations',
      value: 24,
      icon: UserCheck,
      color: 'bg-accent-500',
      change: '+18%',
      changeType: 'increase'
    },
  ];

  const recentAlerts = [
    {
      patient: 'Emma Thompson',
      type: 'High Blood Pressure',
      time: '2 hours ago',
      severity: 'high'
    },
    {
      patient: 'Michael Chen',
      type: 'Missed Appointment',
      time: '4 hours ago',
      severity: 'medium'
    },
    {
      patient: 'Sarah Williams',
      type: 'Normal Checkup Due',
      time: '1 day ago',
      severity: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${stat.changeType === 'increase' ? 'text-accent-500' : 'text-error-500'}`} />
                  <span className={`text-sm ml-1 ${stat.changeType === 'increase' ? 'text-accent-600' : 'text-error-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Vitals Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Vitals Trend</h3>
            <Activity className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitalsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bloodPressure" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="heartRate" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Alerts and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    alert.severity === 'high' ? 'bg-error-500' : 
                    alert.severity === 'medium' ? 'bg-warning-500' : 'bg-accent-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.patient}</p>
                    <p className="text-sm text-gray-600">{alert.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {patients.filter(p => p.nextAppointment).map((patient, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <Heart className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">
                      Risk Score: {patient.riskScore}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {patient.nextAppointment}
                  </p>
                  <p className="text-sm text-gray-500">09:00 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;