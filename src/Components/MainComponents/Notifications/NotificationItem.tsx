"use client";

import React from 'react';
import { Notification, NotificationType, NotificationPriority } from '../../../services/notificationService';
import { useNotifications } from '../../../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

/**
 * Component to display a single notification
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const { markAsRead, deleteNotification } = useNotifications();
  
  // Format the notification timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.SEARCH_SPIKE:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      case NotificationType.FILTER_TREND:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        );
      case NotificationType.HIGH_VALUE_LISTING:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case NotificationType.LISTING_POPULARITY:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case NotificationType.SYSTEM_ALERT:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };
  
  // Get background color based on priority
  const getBackgroundColor = () => {
    if (notification.isRead) {
      return 'bg-gray-50';
    }
    
    switch (notification.priority) {
      case NotificationPriority.CRITICAL:
        return 'bg-red-50';
      case NotificationPriority.HIGH:
        return 'bg-orange-50';
      case NotificationPriority.MEDIUM:
        return 'bg-yellow-50';
      case NotificationPriority.LOW:
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = () => {
    if (notification.id && !notification.isRead) {
      markAsRead(notification.id);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (notification.id) {
      deleteNotification(notification.id);
    }
  };
  
  return (
    <div
      className={`${getBackgroundColor()} border-b border-gray-200 px-4 py-3 hover:bg-gray-100`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <div className="ml-2 flex flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  if (onClose) onClose();
                }}
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Delete notification"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
          <p className="mt-1 text-xs text-gray-500">
            {notification.createdAt && formatTimestamp(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
