import React from 'react';
import NotificationDemo from './NotificationDemo';

/**
 * Example page for the notification system
 */
export default function NotificationExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Notification System Example</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates the real-time notification system implemented in VowSwap.
        The system allows administrators and relevant stakeholders to receive notifications
        about important platform activities as they happen.
      </p>
      
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Features</h2>
        <ul className="list-inside list-disc space-y-2 text-gray-600">
          <li>Real-time notifications via WebSockets</li>
          <li>Notification rules engine for determining significant events</li>
          <li>Customizable notification preferences</li>
          <li>Notification bell with unread count</li>
          <li>Notification list with read/unread status</li>
          <li>Mark notifications as read</li>
          <li>Delete notifications</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Live Demo</h2>
        <NotificationDemo />
      </div>
      
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Implementation Details</h2>
        <p className="mb-4 text-gray-600">
          The notification system consists of several components:
        </p>
        
        <h3 className="mb-2 text-lg font-medium">Backend</h3>
        <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
          <li>Notification service for creating and managing notifications</li>
          <li>Rules engine for determining when to create notifications</li>
          <li>WebSocket server for real-time communication</li>
          <li>API endpoints for managing notifications and preferences</li>
        </ul>
        
        <h3 className="mb-2 text-lg font-medium">Frontend</h3>
        <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
          <li>NotificationBell component for displaying unread count</li>
          <li>NotificationList component for displaying notifications</li>
          <li>NotificationItem component for displaying a single notification</li>
          <li>NotificationPreferences component for managing preferences</li>
          <li>useNotifications hook for managing notification state</li>
          <li>useWebSocket hook for WebSocket communication</li>
        </ul>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Documentation</h2>
        <p className="text-gray-600">
          For more information about the notification system, please refer to the{' '}
          <a
            href="/docs/NotificationSystem.md"
            className="text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notification System Documentation
          </a>
          .
        </p>
      </div>
    </div>
  );
}
