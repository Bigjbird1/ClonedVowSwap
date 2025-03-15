import React from 'react';
import Link from 'next/link';
import NotificationList from '../../Components/MainComponents/Notifications/NotificationList';

/**
 * Notifications page
 */
export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Link
          href="/notifications/preferences"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Notification Preferences
        </Link>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <NotificationList showAll={true} />
      </div>
    </div>
  );
}
