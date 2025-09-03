import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  ExclamationTriangleIcon,
  HeartIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  BellIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalEmergencies: 0,
    activeEmergencies: 0,
    criticalEmergencies: 0,
    resolvedEmergencies: 0,
    totalHospitals: 0,
    totalDoctors: 0,
    totalAmbulances: 0,
    responseTime: 0
  });
  const [recentEmergencies, setRecentEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    if (socket) {
      socket.on('new-emergency', handleNewEmergency);
      socket.on('emergency-status-updated', handleStatusUpdate);
    }

    return () => {
      if (socket) {
        socket.off('new-emergency');
        socket.off('emergency-status-updated');
      }
    };
  }, [socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'x-auth-token': localStorage.getItem('medemo_token')
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load recent emergencies
      const emergenciesResponse = await fetch('/api/emergency/recent', {
        headers: {
          'x-auth-token': localStorage.getItem('medemo_token')
        }
      });
      
      if (emergenciesResponse.ok) {
        const emergenciesData = await emergenciesResponse.json();
        setRecentEmergencies(emergenciesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewEmergency = (emergency) => {
    setStats(prev => ({
      ...prev,
      totalEmergencies: prev.totalEmergencies + 1,
      activeEmergencies: prev.activeEmergencies + 1
    }));
    
    setRecentEmergencies(prev => [emergency, ...prev.slice(0, 4)]);
  };

  const handleStatusUpdate = (update) => {
    if (update.status === 'completed' || update.status === 'cancelled') {
      setStats(prev => ({
        ...prev,
        activeEmergencies: Math.max(0, prev.activeEmergencies - 1),
        resolvedEmergencies: prev.resolvedEmergencies + 1
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'en-route':
        return 'bg-purple-100 text-purple-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const quickActions = [
    {
      name: 'Create Emergency',
      href: '/emergency',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-red-600',
      description: 'Report a new emergency'
    },
    {
      name: 'Find Hospital',
      href: '/hospitals',
      icon: BuildingOfficeIcon,
      color: 'from-blue-500 to-blue-600',
      description: 'Locate nearest hospitals'
    },
    {
      name: 'Blood Bank',
      href: '/blood-banks',
      icon: HeartIcon,
      color: 'from-pink-500 to-pink-600',
      description: 'Find blood availability'
    },
    {
      name: 'Doctor Consultation',
      href: '/consultations',
      icon: UserGroupIcon,
      color: 'from-green-500 to-green-600',
      description: 'Connect with doctors'
    },
    {
      name: 'Ambulance',
      href: '/ambulance',
      icon: TruckIcon,
      color: 'from-purple-500 to-purple-600',
      description: 'Request ambulance'
    },
    {
      name: 'AI Triage',
      href: '/ai-triage',
      icon: HeartSolidIcon,
      color: 'from-indigo-500 to-indigo-600',
      description: 'AI symptom analysis'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="mt-2 text-blue-100">
                Here's what's happening with your healthcare services today
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.activeEmergencies}</div>
                  <div className="text-sm text-blue-100">Active Emergencies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.responseTime}min</div>
                  <div className="text-sm text-blue-100">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Emergencies</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEmergencies}</p>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>12% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hospitals</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalHospitals}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>Available for emergencies</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Doctors Online</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDoctors}</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span>Available for consultation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TruckIcon className="w-8 h-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ambulances</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAmbulances}</p>
                <div className="flex items-center text-sm text-purple-600">
                  <span>Ready for dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Emergencies and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Emergencies */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Emergencies</h3>
            </div>
            <div className="p-6">
              {recentEmergencies.length > 0 ? (
                <div className="space-y-4">
                  {recentEmergencies.map((emergency) => (
                    <div key={emergency._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          emergency.severity === 'critical' ? 'bg-red-500' : 
                          emergency.severity === 'high' ? 'bg-orange-500' : 
                          emergency.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {emergency.patientName}
                          </p>
                          <p className="text-xs text-gray-500">{emergency.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(emergency.severity)}`}>
                          {emergency.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent emergencies</p>
                </div>
              )}
              <div className="mt-4">
                <Link
                  to="/emergency"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all emergencies →
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications and Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <BellIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">System Update</p>
                    <p className="text-sm text-blue-700">New features available in emergency response</p>
                    <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Service Available</p>
                    <p className="text-sm text-green-700">New hospital added to network</p>
                    <p className="text-xs text-green-600 mt-1">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Maintenance Notice</p>
                    <p className="text-sm text-yellow-700">Scheduled maintenance tonight at 2 AM</p>
                    <p className="text-xs text-yellow-600 mt-1">6 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all notifications →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <HeartIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Keep emergency contacts updated</p>
            </div>
            <div className="text-center">
              <MapPinIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Enable location services for faster response</p>
            </div>
            <div className="text-center">
              <ClockIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Response time is critical in emergencies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
