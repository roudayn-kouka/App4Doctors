import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';

interface Analysis {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  date: string;
  status: 'pending' | 'processed' | 'reviewed';
  fileName: string;
  fileSize: string;
  results?: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    abnormalValues: { parameter: string; value: string; normal: string; }[];
  };
}

const AnalysisPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([
    {
      id: '1',
      patientId: '1',
      patientName: 'Emma Thompson',
      type: 'Analyse de sang',
      date: '2024-01-27',
      status: 'reviewed',
      fileName: 'blood_test_emma_20240127.pdf',
      fileSize: '2.3 MB',
      results: {
        summary: 'Analyse sanguine complète montrant des valeurs globalement normales avec quelques points d\'attention.',
        keyFindings: [
          'Glycémie légèrement élevée (1.15 g/L)',
          'Cholestérol total dans la norme',
          'Fonction rénale normale',
          'Numération formule sanguine normale'
        ],
        recommendations: [
          'Surveiller la glycémie',
          'Maintenir une alimentation équilibrée',
          'Contrôle dans 3 mois'
        ],
        abnormalValues: [
          { parameter: 'Glycémie', value: '1.15 g/L', normal: '0.70-1.10 g/L' }
        ]
      }
    },
    {
      id: '2',
      patientId: '2',
      patientName: 'Michael Chen',
      type: 'Radiographie thoracique',
      date: '2024-01-26',
      status: 'processed',
      fileName: 'chest_xray_michael_20240126.pdf',
      fileSize: '5.1 MB'
    },
    {
      id: '3',
      patientId: '3',
      patientName: 'Sarah Williams',
      type: 'ECG',
      date: '2024-01-25',
      status: 'pending',
      fileName: 'ecg_sarah_20240125.pdf',
      fileSize: '1.8 MB'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    patientName: '',
    analysisType: '',
    file: null as File | null
  });

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || analysis.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-800';
      case 'processed': return 'bg-primary-100 text-primary-800';
      case 'reviewed': return 'bg-accent-100 text-accent-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processed': return <AlertCircle className="h-4 w-4" />;
      case 'reviewed': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processed': return 'Traitée';
      case 'reviewed': return 'Validée';
      default: return status;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      patientId: Math.random().toString(),
      patientName: uploadForm.patientName,
      type: uploadForm.analysisType,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      fileName: uploadForm.file.name,
      fileSize: `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    setAnalyses(prev => [newAnalysis, ...prev]);
    setUploadForm({ patientName: '', analysisType: '', file: null });
    setUploadModalOpen(false);

    // Simuler le traitement automatique après 3 secondes
    setTimeout(() => {
      setAnalyses(prev => prev.map(a => 
        a.id === newAnalysis.id 
          ? { ...a, status: 'processed' as const }
          : a
      ));
    }, 3000);
  };

  const handleViewAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setViewModalOpen(true);
  };

  const simulateAIProcessing = (id: string) => {
    setAnalyses(prev => prev.map(a => 
      a.id === id 
        ? { 
            ...a, 
            status: 'reviewed' as const,
            results: {
              summary: 'Analyse automatique par IA terminée. Résultats extraits et structurés.',
              keyFindings: [
                'Paramètres principaux identifiés',
                'Valeurs anormales détectées',
                'Tendances analysées'
              ],
              recommendations: [
                'Consultation de suivi recommandée',
                'Surveillance des paramètres anormaux'
              ],
              abnormalValues: [
                { parameter: 'Paramètre X', value: 'Valeur Y', normal: 'Norme Z' }
              ]
            }
          }
        : a
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analyses Médicales</h1>
          <p className="text-gray-600">Extraction et analyse automatique des résultats</p>
        </div>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Uploader Analyse
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyses.length}</p>
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
                {analyses.filter(a => a.status === 'pending').length}
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
              <p className="text-sm font-medium text-gray-600">Traitées</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {analyses.filter(a => a.status === 'processed').length}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-accent-600 mt-1">
                {analyses.filter(a => a.status === 'reviewed').length}
              </p>
            </div>
            <div className="bg-accent-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-accent-600" />
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
              placeholder="Rechercher des analyses..."
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
              <option value="pending">En attente</option>
              <option value="processed">Traitées</option>
              <option value="reviewed">Validées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analyses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Analyses récentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{analysis.patientName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {analysis.date}
                        <span>•</span>
                        <span>{analysis.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-13 space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📄 {analysis.fileName}</span>
                      <span>📊 {analysis.fileSize}</span>
                    </div>
                    
                    {analysis.results && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-gray-700 mb-2">{analysis.results.summary}</p>
                        {analysis.results.abnormalValues.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {analysis.results.abnormalValues.map((val, idx) => (
                              <span key={idx} className="px-2 py-1 bg-warning-100 text-warning-800 rounded text-xs">
                                {val.parameter}: {val.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)} flex items-center gap-1`}>
                    {getStatusIcon(analysis.status)}
                    {getStatusLabel(analysis.status)}
                  </span>
                  
                  {analysis.status === 'processed' && (
                    <button
                      onClick={() => simulateAIProcessing(analysis.id)}
                      className="bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Analyser IA
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleViewAnalysis(analysis)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Uploader une analyse</h2>
              <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                <select
                  value={uploadForm.patientName}
                  onChange={(e) => setUploadForm({...uploadForm, patientName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  <option value="Emma Thompson">Emma Thompson</option>
                  <option value="Michael Chen">Michael Chen</option>
                  <option value="Sarah Williams">Sarah Williams</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'analyse</label>
                <select
                  value={uploadForm.analysisType}
                  onChange={(e) => setUploadForm({...uploadForm, analysisType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner le type</option>
                  <option value="Analyse de sang">Analyse de sang</option>
                  <option value="Radiographie">Radiographie</option>
                  <option value="ECG">ECG</option>
                  <option value="IRM">IRM</option>
                  <option value="Scanner">Scanner</option>
                  <option value="Échographie">Échographie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier d'analyse</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.dcm"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700">Cliquer pour uploader</span>
                    <span className="text-gray-600"> ou glisser-déposer</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PDF, JPG, PNG, DICOM jusqu'à 10MB</p>
                  {uploadForm.file && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadForm.file.name}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Uploader et Analyser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Analysis Modal */}
      {viewModalOpen && selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Détails de l'analyse</h2>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Patient:</strong> {selectedAnalysis.patientName}</p>
                    <p><strong>Type:</strong> {selectedAnalysis.type}</p>
                    <p><strong>Date:</strong> {selectedAnalysis.date}</p>
                    <p><strong>Fichier:</strong> {selectedAnalysis.fileName}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Statut</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAnalysis.status)} flex items-center gap-2 w-fit`}>
                    {getStatusIcon(selectedAnalysis.status)}
                    {getStatusLabel(selectedAnalysis.status)}
                  </span>
                </div>
              </div>

              {selectedAnalysis.results && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Résumé</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedAnalysis.results.summary}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Principales observations</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedAnalysis.results.keyFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Recommandations</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedAnalysis.results.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedAnalysis.results.abnormalValues.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Valeurs anormales</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paramètre</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Normale</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedAnalysis.results.abnormalValues.map((val, idx) => (
                              <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{val.parameter}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{val.value}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{val.normal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;