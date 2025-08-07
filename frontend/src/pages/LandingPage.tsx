import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatbotWidget from '../components/ChatbotWidget';
import { 
  Heart, 
  Users, 
  Calendar, 
  Video, 
  FileText, 
  Shield, 
  Brain, 
  Activity,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Smartphone,
  Clock,
  Mail,
  Phone,
  MapPin,
  Send,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const features = [
    {
      icon: Users,
      title: "Gestion Patient Centralisée",
      description: "Dossier médical unifié avec historique complet, constantes vitales et suivi IoT en temps réel."
    },
    {
      icon: Brain,
      title: "IA Médicale Avancée",
      description: "Support décisionnel clinique avec score de risque, diagnostic assisté et suggestions thérapeutiques."
    },
    {
      icon: Video,
      title: "Téléconsultation Intégrée",
      description: "Consultations vidéo sécurisées avec chatbot multilingue et assistant vocal intelligent."
    },
    {
      icon: Calendar,
      title: "Planning Prédictif",
      description: "RDV intelligents optimisés par IA avec rappels automatiques et réduction d'absentéisme."
    },
    {
      icon: FileText,
      title: "e-Prescription",
      description: "Ordonnances électroniques avec suggestions automatiques et envoi direct en pharmacie."
    },
    {
      icon: Shield,
      title: "Sécurité Maximale",
      description: "Conformité HIPAA/RGPD, chiffrement bout-en-bout et traçabilité blockchain."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Médecins actifs" },
    { number: "500,000+", label: "Patients suivis" },
    { number: "99.9%", label: "Disponibilité" },
    { number: "4.9/5", label: "Satisfaction" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologue",
      text: "App4Doctor a révolutionné ma pratique. L'IA m'aide à prendre de meilleures décisions cliniques.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Médecin généraliste",
      text: "La téléconsultation intégrée me permet de suivre mes patients à distance efficacement.",
      rating: 5
    },
    {
      name: "Dr. Emma Williams",
      specialty: "Pédiatre",
      text: "L'interface intuitive et les fonctionnalités IA font gagner un temps précieux au quotidien.",
      rating: 5
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending contact form
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setIsContactModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/Capture d'écran 2025-07-03 121255.png" 
                alt="App4Doctor Logo" 
                className="h-12 w-auto mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">App4Doctor</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Fonctionnalités
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                À propos
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Témoignages
              </button>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Contact
              </button>
            </nav>
            <Link 
              to="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                La plateforme médicale
                <span className="text-primary-600"> intelligente</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                App4Doctor combine gestion patient, IA médicale et téléconsultation dans une solution cloud sécurisée. 
                Optimisez vos soins avec l'intelligence artificielle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="border border-gray-300 hover:border-primary-600 text-gray-700 px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                  Voir la démo
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
                alt="Médecin utilisant App4Doctor"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-100 p-2 rounded-full">
                    <Activity className="h-6 w-6 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Suivi en temps réel</p>
                    <p className="text-sm text-gray-600">Constantes vitales IoT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités avancées
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils médicaux alimentés par l'intelligence artificielle 
              pour optimiser vos soins et améliorer l'expérience patient.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-primary-100 p-3 rounded-full w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                À propos d'App4Doctor
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                App4Doctor est une plateforme SaaS révolutionnaire développée par <strong className="text-primary-600">Pixemantic</strong>, 
                conçue pour transformer la pratique médicale moderne grâce à l'intelligence artificielle et aux technologies de pointe.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Notre mission est de permettre aux professionnels de santé de fournir des soins de qualité supérieure 
                tout en optimisant leur efficacité opérationnelle et en améliorant l'expérience patient.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-accent-600" />
                  <span className="text-gray-700">Plateforme cloud sécurisée et évolutive</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-accent-600" />
                  <span className="text-gray-700">Intelligence artificielle médicale certifiée</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-accent-600" />
                  <span className="text-gray-700">Conformité internationale HIPAA/RGPD</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-accent-600" />
                  <span className="text-gray-700">Support 24/7 et formation continue</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2"
                alt="Équipe médicale utilisant la technologie"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute top-6 right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">IA Médicale</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent-600" />
                  <span className="font-semibold text-gray-900">Sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Technologie de pointe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              App4Doctor utilise les dernières avancées en intelligence artificielle, 
              blockchain et IoT pour offrir une expérience médicale révolutionnaire.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-primary-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IA Médicale</h3>
              <p className="text-sm text-gray-600">BioBERT, XLM-RoBERTa pour l'analyse clinique</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-secondary-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blockchain</h3>
              <p className="text-sm text-gray-600">Hyperledger pour la traçabilité</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-accent-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Activity className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IoT Médical</h3>
              <p className="text-sm text-gray-600">Protocole MQTT pour les capteurs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="bg-warning-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Globe className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Knowledge Graph</h3>
              <p className="text-sm text-gray-600">Neo4j pour les interactions médicales</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos médecins
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez comment App4Doctor transforme la pratique médicale
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img 
                    src={`https://images.pexels.com/photos/${5327585 + index}/pexels-photo-${5327585 + index}.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2`}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à révolutionner votre pratique médicale ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de médecins qui utilisent déjà App4Doctor pour 
            améliorer leurs soins et optimiser leur temps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Commencer gratuitement
            </Link>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="border border-primary-300 hover:border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Planifier une démo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/Capture d'écran 2025-07-03 121255.png" 
                  alt="App4Doctor Logo" 
                  className="h-8 w-auto mr-3"
                />
                <h3 className="text-xl font-bold">App4Doctor</h3>
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme médicale intelligente qui révolutionne les soins de santé.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Globe className="h-4 w-4" />
                <span>Développé par</span>
                <span className="text-primary-400 font-semibold">Pixemantic</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Fonctionnalités</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support 24/7</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Communauté</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">À propos</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Presse</a></li>
                <li><button onClick={() => setIsContactModalOpen(true)} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 App4Doctor by Pixemantic. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Smartphone className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Clock className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Contactez-nous</h2>
              </div>
              <button 
                onClick={() => setIsContactModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner un sujet</option>
                  <option value="demo">Demande de démo</option>
                  <option value="pricing">Informations tarifaires</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  placeholder="Décrivez votre demande..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Informations de contact</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>contact@app4doctor.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>123 Avenue de la Santé, 75014 Paris</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default LandingPage;