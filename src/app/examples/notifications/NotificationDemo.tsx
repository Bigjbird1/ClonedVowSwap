"use client";

import React, { useState } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import NotificationBell from '../../../Components/MainComponents/Notifications/NotificationBell';
import { NotificationType, NotificationPriority } from '../../../services/notificationService';

/**
 * Demo component for the notification system
 */
const NotificationDemo: React.FC = () => {
  const { notifications, connected } = useNotifications();
  const [notificationType, setNotificationType] = useState<NotificationType>(NotificationType.SEARCH_SPIKE);
  const [notificationPriority, setNotificationPriority] = useState<NotificationPriority>(NotificationPriority.MEDIUM);
  const [notificationTitle, setNotificationTitle] = useState<string>('Search Spike Detected');
  const [notificationMessage, setNotificationMessage] = useState<string>('Unusual spike in searches for "wedding dress"');
  
  // Create a test notification
  const createTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: notificationType,
          priority: notificationPriority,
          title: notificationTitle,
          message: notificationMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test notification');
      }
      
      // Show success message
      alert('Test notification created successfully!');
    } catch (error) {
      console.error('Error creating test notification:', error);
      alert('Error creating test notification. See console for details.');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Notification Bell</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <NotificationBell />
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Click the bell icon to see your notifications.
              {connected ? (
                <span className="ml-2 text-green-600">
                  (WebSocket connected)
                </span>
              ) : (
                <span className="ml-2 text-red-600">
                  (WebSocket disconnected)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Create Test Notification</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="notification-type" className="block text-sm font-medium text-gray-700">
              Notification Type
            </label>
            <select
              id="notification-type"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as NotificationType)}
            >
              {Object.values(NotificationType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="notification-priority" className="block text-sm font-medium text-gray-700">
              Notification Priority
            </label>
            <select
              id="notification-priority"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              value={notificationPriority}
              onChange={(e) => setNotificationPriority(e.target.value as NotificationPriority)}
            >
              {Object.values(NotificationPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700">
              Notification Title
            </label>
            <input
              type="text"
              id="notification-title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700">
              Notification Message
            </label>
            <textarea
              id="notification-message"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="button"
              onClick={createTestNotification}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Test Notification
            </button>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Current Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet. Create a test notification to see it here.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${
                  notification.isRead ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Type: {notification.type} | Priority: {notification.priority} | 
                      {notification.isRead ? ' Read' : ' Unread'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Notification Pages</h3>
        <div className="space-y-2">
          <p>
            <a
              href="/notifications"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All Notifications
            </a>
          </p>
          <p>
            <a
              href="/notifications/preferences"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Notification Preferences
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;
