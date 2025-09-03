import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import EmergencyAlert from './components/EmergencyAlert';
import EmergencyList from './components/EmergencyList';
import EmergencyMap from './components/EmergencyMap';
import EmergencyStats from './components/EmergencyStats';
import { 
  ExclamationTriangleIcon, 
  PlusIcon,
  MapIcon,
  ListBulletIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Emergency = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map', 'stats'
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    resolved: 0
  });

  useEffect(() => {
    loadEmergencies();
    loadStats();

    // Socket event listeners
    if (socket) {
      socket.on('new-emergency', handleNewEmergency);
      socket.on('emergency-status-updated', handleStatusUpdate);
      socket.on('ambulance-assigned', handleAmbulanceAssignment);
      socket.on('location-updated', handleLocationUpdate);
    }

    return () => {
      if (socket) {
        socket.off('new-emergency');
        socket.off('emergency-status-updated');
        socket.off('ambulance-assigned');
        socket.off('location-updated');
      }
    };
  }, [socket]);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emergency/active', {
        headers: {
          'x-auth-token': localStorage.getItem('medemo_token')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmergencies(data);
      }
    } catch (error) {
      console.error('Error loading emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/emergency/stats', {
        headers: {
          'x-auth-token': localStorage.getItem('medemo_token')
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNewEmergency = (emergency) => {
    setEmergencies(prev => [emergency, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      active: prev.active + 1
    }));
  };

  const handleStatusUpdate = (update) => {
    setEmergencies(prev => 
      prev.map(emergency => 
        emergency.emergencyId === update.emergencyId
          ? { ...emergency, status: update.status }
          : emergency
      )
    );
  };

  const handleAmbulanceAssignment = (assignment) => {
    setEmergencies(prev => 
      prev.map(emergency => 
        emergency.emergencyId === assignment.emergencyId
          ? { ...emergency, assignedAmbulance: assignment.ambulance }
          : emergency
      )
    );
  };

  const handleLocationUpdate = (update) => {
    setEmergencies(prev => 
      prev.map(emergency => 
        emergency.emergencyId === update.emergencyId
          ? { ...emergency, location: update.location }
          : emergency
      )
    );
  };

  const handleEmergencyCreated = (newEmergency) => {
    setEmergencies(prev => [newEmergency, ...prev]);
    setShowEmergencyForm(false);
    loadStats();
  };

  const renderViewMode = () => {
    switch (viewMode) {
      case 'map':
        return <EmergencyMap emergencies={emergencies} />;
      case 'stats':
        return <EmergencyStats stats={stats} />;
      default:
        return <EmergencyList emergencies={emergencies} loading={loading} onRefresh={loadEmergencies} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                <h1 className="text-2xl font-bold text-gray-900">Emergency Management</h1>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span>Live Monitoring</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEmergencyForm(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'list'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ListBulletIcon className="w-5 h-5 inline mr-2" />
              Emergency List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'map'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapIcon className="w-5 h-5 inline mr-2" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'stats'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Statistics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emergencies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Critical</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.critical}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="bg-white rounded-lg shadow">
          {renderViewMode()}
        </div>
      </div>

      {/* Emergency Alert Form Modal */}
      {showEmergencyForm && (
        <EmergencyAlert
          onClose={() => setShowEmergencyForm(false)}
          onEmergencyCreated={handleEmergencyCreated}
          user={user}
        />
      )}
    </div>
  );
};

export default Emergency;
