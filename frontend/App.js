import React, { useState } from 'react';
import CensoMunicipalForm from './components/CensoForm';
import AdminPanel from './components/AdminPanel';
import { Users, Settings, FileText, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('form'); // 'form' | 'admin'

  const Navigation = () => (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8" />
            <h1 className="text-xl font-bold">
              Censo Municipal 2025 - Comodoro Rivadavia
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentView === 'admin' && (
            <button
              onClick={() => setCurrentView('form')}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Formulario
            </button>
          )}
          
          {currentView === 'form' && (
            <button
              onClick={() => setCurrentView('admin')}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
            >
              <Settings className="w-4 h-4" />
              Panel Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Censo Municipal Comodoro Rivadavia 2025
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de actualización de datos para empleados municipales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Completar Censo
              </h2>
              <p className="text-gray-600 mb-6">
                Formulario obligatorio para actualizar tus datos personales y laborales
              </p>
              <button
                onClick={() => setCurrentView('form')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full"
              >
                Iniciar Formulario
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-300">
            <div className="text-center">
              <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Panel de Administración
              </h2>
              <p className="text-gray-600 mb-6">
                Gestionar datos del censo, estadísticas y exportación de reportes
              </p>
              <button
                onClick={() => setCurrentView('admin')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full"
              >
                Acceder al Panel
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información Importante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <strong className="text-yellow-800">Obligatorio:</strong>
              <p>Todos los empleados municipales deben completar este censo.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <strong className="text-blue-800">Actualización:</strong>
              <p>Debes actualizar cambios de domicilio o beneficiarios en 30 días.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <strong className="text-green-800">Formato:</strong>
              <p>Completar todo el formulario en letra mayúscula.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentView !== 'home' && <Navigation />}
      
      {currentView === 'home' && <HomePage />}
      {currentView === 'form' && <CensoMunicipalForm />}
      {currentView === 'admin' && <AdminPanel />}
    </div>
  );
}

export default App;
