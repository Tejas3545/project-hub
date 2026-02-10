'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/AuthContext';
import { authApi, userApi } from '@/lib/api';
import CloudinaryUpload from '@/components/CloudinaryUpload';

interface UserStats {
  uploadedProjects: number;
  projectsSaved: number;
  projectsStarted: number;
  projectsCompleted: number;
  likesReceived: number;
  upvotesReceived: number;
}

interface ActivityItem {
  id: string;
  type: 'project_upload' | 'like' | 'comment' | 'progress';
  timestamp: string;
  projectId?: string;
  projectTitle?: string;
  content?: string;
  status?: string;
}

type ActivityTab = 'all' | 'uploads' | 'likes' | 'comments';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    uploadedProjects: 0,
    projectsSaved: 0,
    projectsStarted: 0,
    projectsCompleted: 0,
    likesReceived: 0,
    upvotesReceived: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profileImage: '',
    bio: '',
  });
  const [activeTab, setActiveTab] = useState<ActivityTab>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImage: (user as { profileImage?: string }).profileImage || '',
        bio: (user as { bio?: string }).bio || '',
      });
      loadStats();
      loadActivity();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await userApi.getProfileStats();
      setStats({
        uploadedProjects: data.uploadedProjects || 0,
        projectsSaved: data.projectsSaved || 0,
        projectsStarted: data.projectsStarted || 0,
        projectsCompleted: data.projectsCompleted || 0,
        likesReceived: data.likesReceived || 0,
        upvotesReceived: data.upvotesReceived || 0,
      });
    } catch {
      // Keep defaults on error
    }
  };

  const loadActivity = async () => {
    setIsLoadingActivity(true);
    try {
      const data = await userApi.getActivity();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load activity:', error);
      setActivities([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileImage: formData.profileImage || undefined,
        bio: formData.bio || undefined,
      });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile.';
      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Decorative gradient backgrounds */}
        <div className="fixed top-20 right-10 w-96 h-96 gradient-purple-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 left-10 w-80 h-80 gradient-blue-purple opacity-5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-10 relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-cyan-blue mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Update your profile and track your learning stats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Profile Card */}
          <div className="bg-card border border-border/30 rounded-xl p-6 lg:col-span-1 hover-lift">
            <div className="flex flex-col items-center text-center gap-4">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={user?.firstName || 'User'}
                  className="w-28 h-28 rounded-full object-cover border-2 border-primary/40"
                />
              ) : (
                <div className="w-28 h-28 rounded-full gradient-blue-purple flex items-center justify-center text-2xl font-bold text-white">
                  {(user?.firstName || 'U')[0]}
                </div>
              )}

              <div>
                <p className="text-xl font-semibold text-foreground">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {formData.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{formData.bio}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Profile Photo</p>
              <CloudinaryUpload
                multiple={false}
                maxFiles={1}
                existingImages={formData.profileImage ? [formData.profileImage] : []}
                onUploadSuccess={(urls) => {
                  setFormData((prev) => ({ ...prev, profileImage: urls[0] || '' }));
                  setIsEditing(true);
                }}
                onError={(error) => setMessage(error)}
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-card border border-border/30 rounded-xl p-6 lg:col-span-2 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Profile Details</h2>
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground border border-border/30 transition"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">First Name</label>
                <input
                  type="text"
                  aria-label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/30 text-foreground disabled:opacity-70 focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Last Name</label>
                <input
                  type="text"
                  aria-label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/30 text-foreground disabled:opacity-70 focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  aria-label="Email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/30 text-foreground opacity-70"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted-foreground mb-2">Short Bio</label>
                <textarea
                  aria-label="Short Bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border/30 text-foreground disabled:opacity-70 focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!isEditing || isSaving}
                className="px-5 py-2 rounded-lg gradient-blue-purple text-white font-medium disabled:opacity-50 shadow-md shadow-primary/20 hover:shadow-lg transition"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {message && <span className="text-sm text-muted-foreground">{message}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10 relative">
          <StatCard label="Uploaded" value={stats.uploadedProjects} color="bg-blue-accent" borderColor="border-primary/30" />
          <StatCard label="Saved" value={stats.projectsSaved} color="bg-cyan-accent" borderColor="border-cyan-500/30" />
          <StatCard label="Started" value={stats.projectsStarted} color="bg-purple-accent" borderColor="border-purple-500/30" />
          <StatCard label="Completed" value={stats.projectsCompleted} color="bg-success-accent" borderColor="border-green-500/30" />
          <StatCard label="Likes" value={stats.likesReceived} color="bg-cyan-accent" borderColor="border-cyan-500/30" />
          <StatCard label="Upvotes" value={stats.upvotesReceived} color="bg-purple-accent" borderColor="border-purple-500/30" />
        </div>

        {/* Activity Section */}
        <div className="mt-12 relative">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gradient-blue-purple mb-2">Activity Timeline</h2>
            <p className="text-muted-foreground">Your recent actions and contributions</p>
          </div>

          {/* Activity Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              All Activity
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'uploads'
                  ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              Uploaded Projects
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'likes'
                  ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              Likes Received
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'gradient-blue-purple text-white shadow-md shadow-primary/20'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 border border-border/30'
              }`}
            >
              Comments
            </button>
          </div>

          {/* Activity Feed */}
          <div className="bg-card border border-border/30 rounded-xl p-6 hover-lift">
            {isLoadingActivity ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
                <p className="text-muted-foreground mt-4">Loading activity...</p>
              </div>
            ) : (
              <ActivityFeed activities={activities} activeTab={activeTab} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ActivityFeed({ activities, activeTab }: { activities: ActivityItem[]; activeTab: ActivityTab }) {
  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'uploads') return activity.type === 'project_upload';
    if (activeTab === 'likes') return activity.type === 'like';
    if (activeTab === 'comments') return activity.type === 'comment';
    return true;
  });

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No activity to show</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'project_upload':
        return (
          <div className="w-10 h-10 rounded-full bg-success-accent border border-green-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'like':
        return (
          <div className="w-10 h-10 rounded-full bg-cyan-accent border border-cyan-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-accent border border-primary/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'progress':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-accent border border-purple-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (activity.type) {
      case 'project_upload':
        return 'Uploaded a new project';
      case 'like':
        return 'Received a like';
      case 'comment':
        return 'Commented on a project';
      case 'progress':
        return activity.status === 'COMPLETED' ? 'Completed a project' : 'Updated project status';
      default:
        return 'Activity';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-card border border-border/30 hover:border-primary/30 hover-lift transition-colors">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-foreground font-medium">{getTitle()}</p>
            {activity.projectTitle && activity.projectId && (
              <Link
                href={`/projects/${activity.projectId}`}
                className="text-primary hover:underline font-medium"
              >
                {activity.projectTitle}
              </Link>
            )}
            {activity.content && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{activity.content}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, borderColor }: { label: string; value: number; color?: string; borderColor?: string }) {
  return (
    <div className={`bg-card border ${borderColor || 'border-border/30'} ${color || ''} rounded-xl p-4 text-center hover-lift`}>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}