import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  HeartIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      access: true
    },
    {
      name: 'Emergency',
      href: '/emergency',
      icon: ExclamationTriangleIcon,
      access: true,
      badge: 'Live'
    },
    {
      name: 'Hospitals',
      href: '/hospitals',
      icon: BuildingOfficeIcon,
      access: true
    },
    {
      name: 'Blood Banks',
      href: '/blood-banks',
      icon: HeartIcon,
      access: true
    },
    {
      name: 'Doctors',
      href: '/doctors',
      icon: UserGroupIcon,
      access: true
    },
    {
      name: 'Consultations',
      href: '/consultations',
      icon: ChatBubbleLeftRightIcon,
      access: hasPermission('doctor') || user?.userType === 'patient'
    },
    {
      name: 'Ambulance',
      href: '/ambulance',
      icon: TruckIcon,
      access: hasPermission('ambulance') || hasPermission('admin')
    },
    {
      name: 'AI Triage',
      href: '/ai-triage',
      icon: AcademicCapIcon,
      access: true
    },
    {
      name: 'Health Data',
      href: '/health-data',
      icon: ClipboardDocumentListIcon,
      access: true
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: BellIcon,
      access: true
    },
    {
      name: 'Map View',
      href: '/map',
      icon: MapIcon,
      access: true
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      access: true
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">MedEmo</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* User Profile Section */}
      {!collapsed && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.userType} • {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems
          .filter(item => item.access)
          .map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-700'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between">
                  {item.name}
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {!collapsed && (
          <Link
            to="/profile"
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Profile
          </Link>
        )}
        
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Emergency Quick Access (Always Visible) */}
      <div className="p-4">
        <Link
          to="/emergency"
          className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
        >
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          {!collapsed && 'EMERGENCY'}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
