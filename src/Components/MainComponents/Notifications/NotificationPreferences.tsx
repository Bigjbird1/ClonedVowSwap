"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationType } from '../../../services/notificationService';

/**
 * Component for managing notification preferences
 */
const NotificationPreferences: React.FC = () => {
  const { preferences, preferencesLoading, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Initialize local preferences from the server
  useEffect(() => {
    if (!preferencesLoading) {
      setLocalPreferences(preferences);
    }
  }, [preferences, preferencesLoading]);
  
  // Get notification type display name
  const getNotificationTypeDisplayName = (type: string): string => {
    switch (type) {
      case NotificationType.SEARCH_SPIKE:
        return 'Search Spikes';
      case NotificationType.FILTER_TREND:
        return 'Filter Trends';
      case NotificationType.HIGH_VALUE_LISTING:
        return 'High-Value Listings';
      case NotificationType.LISTING_POPULARITY:
        return 'Popular Listings';
      case NotificationType.SYSTEM_ALERT:
        return 'System Alerts';
      case NotificationType.USER_ACTIVITY:
        return 'User Activity';
      case NotificationType.ABUSE_DETECTION:
        return 'Abuse Detection';
      default:
        return type;
    }
  };
  
  // Get notification type description
  const getNotificationTypeDescription = (type: string): string => {
    switch (type) {
      case NotificationType.SEARCH_SPIKE:
        return 'Notifications about unusual spikes in search volume for specific terms';
      case NotificationType.FILTER_TREND:
        return 'Notifications about emerging trends in filter usage';
      case NotificationType.HIGH_VALUE_LISTING:
        return 'Notifications about high-value listings receiving attention';
      case NotificationType.LISTING_POPULARITY:
        return 'Notifications about listings that are receiving a lot of views';
      case NotificationType.SYSTEM_ALERT:
        return 'Critical system alerts and notifications';
      case NotificationType.USER_ACTIVITY:
        return 'Notifications about user activity on the platform';
      case NotificationType.ABUSE_DETECTION:
        return 'Notifications about potential abuse or suspicious activity';
      default:
        return 'Notification settings';
    }
  };
  
  // Handle toggle change
  const handleToggleChange = (type: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  
  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const success = await updatePreferences(localPreferences);
      
      if (success) {
        setSaveMessage({
          type: 'success',
          text: 'Preferences saved successfully',
        });
      } else {
        setSaveMessage({
          type: 'error',
          text: 'Failed to save preferences',
        });
      }
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'An error occurred while saving preferences',
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  // Get all notification types
  const notificationTypes = Object.values(NotificationType);
  
  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <span className="ml-2">Loading preferences...</span>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose which notifications you want to receive
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {notificationTypes.map((type) => (
          <div key={type} className="flex items-start px-6 py-4">
            <div className="flex h-5 items-center">
              <input
                id={`notification-${type}`}
                name={`notification-${type}`}
                type="checkbox"
                checked={localPreferences[type] ?? true}
                onChange={() => handleToggleChange(type)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`notification-${type}`}
                className="font-medium text-gray-700"
              >
                {getNotificationTypeDisplayName(type)}
              </label>
              <p className="text-gray-500">
                {getNotificationTypeDescription(type)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          {saveMessage && (
            <div
              className={`text-sm ${
                saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="ml-auto rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
