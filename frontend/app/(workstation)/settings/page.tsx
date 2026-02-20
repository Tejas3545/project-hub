'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { authApi } from '@/lib/api';
import { 
  User, 
  Bell, 
  Shield, 
  Save,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

type SettingsTab = 'account' | 'notifications' | 'security';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account form state
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    achievementAlerts: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    if (user) {
      setAccountForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(accountForm);
      await refreshUser();
      showMessage('success', 'Profile updated successfully');
    } catch {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Save to localStorage for now (backend endpoint can be added later)
      localStorage.setItem('notificationPrefs', JSON.stringify(notifications));
      showMessage('success', 'Notification preferences saved');
    } catch {
      showMessage('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationPrefs');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link 
          href="/profile" 
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-2 lg:space-y-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-border p-4 sm:p-6">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Account Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={accountForm.firstName}
                    onChange={(e) => setAccountForm({ ...accountForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={accountForm.lastName}
                    onChange={(e) => setAccountForm({ ...accountForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={accountForm.bio}
                  onChange={(e) => setAccountForm({ ...accountForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Max 500 characters</p>
              </div>

              <button
                onClick={handleSaveAccount}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'projectUpdates', label: 'Project Updates', description: 'Get notified about project changes' },
                  { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Celebrate your accomplishments' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-start sm:items-center justify-between gap-4 p-4 border border-border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">{item.label}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                      aria-label={`Toggle ${item.label}`}
                      role="switch"
                      aria-checked={notifications[item.key as keyof typeof notifications]}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                        style={{ marginTop: '2px' }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Security</h2>
                <p className="text-sm text-muted-foreground">Manage your account security</p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Verified
                  </span>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <p className="font-medium mb-2">Password</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Change your password to keep your account secure
                </p>
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-all">
                  Change Password
                </button>
              </div>

              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="font-medium text-red-700 mb-2">Danger Zone</p>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
