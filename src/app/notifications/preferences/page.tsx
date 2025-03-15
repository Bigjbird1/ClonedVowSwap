import React from 'react';
import NotificationPreferences from '../../../Components/MainComponents/Notifications/NotificationPreferences';

/**
 * Notification preferences page
 */
export default function NotificationPreferencesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Notification Preferences</h1>
      <NotificationPreferences />
    </div>
  );
}
