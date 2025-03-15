"use client";

import React from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { Notification } from '../../../services/notificationService';

interface NotificationListProps {
  onClose?: () => void;
  limit?: number;
  showAll?: boolean;
}

/**
 * Component to display a list of notifications
 */
const NotificationList: React.FC<NotificationListProps> = ({
  onClose,
  limit = 5,
  showAll = false,
}) => {
  const { notifications, loading, error, isAuthenticated } = useNotifications();
  
  // Filter and limit notifications
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, limit);
  
  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="mt-2">Please sign in to view notifications</p>
        <a 
          href="/sign-in" 
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign In
        </a>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <svg
          className="mx-auto h-8 w-8 animate-spin text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-2">Loading notifications...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 py-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  
  if (displayedNotifications.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-2">No notifications</p>
      </div>
    );
  }
  
  return (
    <div className="max-h-96 overflow-y-auto">
      {displayedNotifications.map((notification: Notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationList;
