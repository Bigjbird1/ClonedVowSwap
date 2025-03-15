"use client";

import React, { useState } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationList from './NotificationList';

interface NotificationBellProps {
  className?: string;
}

/**
 * Notification bell component with unread count and dropdown
 */
const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    unreadCount, 
    loading, 
    connected,
    markAllAsRead,
    isAuthenticated,
    error
  } = useNotifications();
  
  const toggleOpen = () => {
    // Only toggle if authenticated
    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      window.location.href = '/sign-in';
      return;
    }
    
    setIsOpen(!isOpen);
    
    // Mark all as read when opening
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Bell icon with unread count */}
      <button
        onClick={toggleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
        title={!isAuthenticated ? "Sign in to view notifications" : "Notifications"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${!isAuthenticated ? 'opacity-50' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Connection status indicator - only show when authenticated */}
        {isAuthenticated && (
          <span 
            className={`absolute top-1 right-1 block h-2 w-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={connected ? 'Connected' : 'Disconnected'}
          />
        )}
        
        {/* Unread count badge - only show when authenticated */}
        {isAuthenticated && !loading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Notification list */}
            <NotificationList onClose={() => setIsOpen(false)} />
            
            {/* View all link */}
            <div className="px-4 py-2 border-t border-gray-200">
              <a
                href="/notifications"
                className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all notifications
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
