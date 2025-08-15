'use client'
import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  Settings as SettingsIcon,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';

const Settings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    weekly: false
  });

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('cs_live_sk_1234567890abcdef');
    // You could add a toast notification here
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 xs:mb-6 lg:mb-8">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm xs:text-base text-gray-600 mt-1 xs:mt-2">
          Manage your account and platform preferences
        </p>
      </div>
      
      <div className="max-w-6xl space-y-4 xs:space-y-6 lg:space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 xs:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-1.5 xs:p-2 bg-blue-100 rounded-lg xs:rounded-xl shrink-0">
                <SettingsIcon className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-semibold text-gray-900">
                General Settings
              </h2>
            </div>
          </div>
          
          <div className="p-4 xs:p-6 space-y-4 xs:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
              <div>
                <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue="ClientSync Corp"
                  className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@clientsync.com"
                  className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                Timezone
              </label>
              <select className="w-full lg:w-1/2 border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (CET)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 xs:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-1.5 xs:p-2 bg-green-100 rounded-lg xs:rounded-xl shrink-0">
                <AlertCircle className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
          </div>
          
          <div className="p-4 xs:p-6 space-y-3 xs:space-y-4 lg:space-y-6">
            {/* Email Notifications */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl gap-3 xs:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm xs:text-base">
                  Email Notifications
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                  Receive email alerts for new tickets and messages
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => toggleNotification('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications.email ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Browser Notifications */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl gap-3 xs:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm xs:text-base">
                  Browser Notifications
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                  Show browser notifications for real-time updates
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => toggleNotification('browser')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications.browser ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.browser ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Weekly Reports */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl gap-3 xs:gap-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm xs:text-base">
                  Weekly Reports
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                  Receive weekly performance summaries
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() => toggleNotification('weekly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notifications.weekly ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.weekly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 xs:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-1.5 xs:p-2 bg-purple-100 rounded-lg xs:rounded-xl shrink-0">
                <TrendingUp className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-semibold text-gray-900">
                API Settings
              </h2>
            </div>
          </div>
          
          <div className="p-4 xs:p-6 space-y-4 xs:space-y-6">
            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex flex-col sm:flex-row gap-2 xs:gap-3">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    defaultValue="cs_live_sk_1234567890abcdef"
                    className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 pr-20 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    readOnly
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={copyApiKey}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <button className="bg-gray-600 text-white px-4 xs:px-6 py-2.5 xs:py-3 rounded-lg xs:rounded-xl hover:bg-gray-700 font-medium transition-all duration-200 text-sm xs:text-base">
                  Regenerate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://your-app.com/webhook"
                className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 xs:p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-1.5 xs:p-2 bg-red-100 rounded-lg xs:rounded-xl shrink-0">
                <AlertCircle className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-semibold text-gray-900">
                Security
              </h2>
            </div>
          </div>
          
          <div className="p-4 xs:p-6 space-y-3 xs:space-y-4 lg:space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm xs:text-base">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="shrink-0">
                <button className="bg-blue-600 text-white px-4 xs:px-6 py-2 xs:py-3 rounded-lg xs:rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 text-sm xs:text-base w-full sm:w-auto">
                  Enable
                </button>
              </div>
            </div>
            
            {/* Session Timeout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 xs:p-4 bg-gray-50 rounded-lg xs:rounded-xl gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm xs:text-base">
                  Session Timeout
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1 break-words">
                  Automatically log out after period of inactivity
                </p>
              </div>
              <div className="shrink-0">
                <select className="border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto min-w-[140px]">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col xs:flex-row xs:justify-end">
          <button className="bg-green-600 text-white px-6 xs:px-8 py-3 rounded-lg xs:rounded-xl hover:bg-green-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 xs:gap-3 text-sm xs:text-base w-full xs:w-auto">
            <CheckCircle size={18} className="xs:w-5 xs:h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
