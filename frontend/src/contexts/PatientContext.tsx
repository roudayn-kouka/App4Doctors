import React, { createContext, useContext, useState } from 'react';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: string;
  allergies: string[];
  conditions: string[];
  lastVisit: string;
  nextAppointment?: string;
  riskScore: number;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    lastUpdated: string;
  };
}

interface PatientContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Emma Thompson',
      email: 'emma.thompson@email.com',
      phone: '+1 (555) 123-4567',
      age: 34,
      gender: 'female',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Shellfish'],
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-28',
      riskScore: 72,
      vitals: {
        bloodPressure: '130/85',
        heartRate: 78,
        temperature: 98.6,
        oxygenSaturation: 98,
        lastUpdated: '2024-01-20T10:30:00Z'
      }
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      age: 45,
      gender: 'male',
      bloodType: 'O-',
      allergies: ['Latex'],
      conditions: ['Asthma'],
      lastVisit: '2024-01-10',
      riskScore: 45,
      vitals: {
        bloodPressure: '120/80',
        heartRate: 68,
        temperature: 98.2,
        oxygenSaturation: 97,
        lastUpdated: '2024-01-18T14:15:00Z'
      }
    },
    {
      id: '3',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      phone: '+1 (555) 456-7890',
      age: 28,
      gender: 'female',
      bloodType: 'B+',
      allergies: [],
      conditions: [],
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-25',
      riskScore: 25,
      vitals: {
        bloodPressure: '115/75',
        heartRate: 72,
        temperature: 98.4,
        oxygenSaturation: 99,
        lastUpdated: '2024-01-19T09:45:00Z'
      }
    }
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const addPatient = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString()
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => 
      prev.map(patient => 
        patient.id === id ? { ...patient, ...updates } : patient
      )
    );
  };

  return (
    <PatientContext.Provider value={{
      patients,
      selectedPatient,
      setSelectedPatient,
      addPatient,
      updatePatient
    }}>
      {children}
    </PatientContext.Provider>
  );
};