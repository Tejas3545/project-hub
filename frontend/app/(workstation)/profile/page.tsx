'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { userApi } from '@/lib/api';
import { Bookmark, GitHubProject as GitHubProjectType } from '@/types';
import GitHubProjectCard from '@/components/GitHubProjectCard';
import { 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Star, 
  History, 
  Bookmark as BookmarkIcon,
  Activity,
  Award,
  Settings,
  Shield,
  Upload,
  Trophy,
  Zap
} from 'lucide-react';
import Link from 'next/link';

type ActivityItem = {
  id: string;
  createdAt: string | Date;
  description?: string;
  type?: string;
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);
  const [userXP, setUserXP] = useState(0);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    githubUrl: '',
    portfolioUrl: '',
    location: '',
  });

  // Fetch data
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        headline: user.headline || '',
        githubUrl: user.githubUrl || '',
        portfolioUrl: user.portfolioUrl || '',
        location: user.location || '',
      });
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookmarksData, activitiesData, progressData, githubProgressData] = await Promise.all([
        userApi.getBookmarks(),
        userApi.getActivities(),
        userApi.getProgress(),
        userApi.getGithubProgress(),
      ]);
      setBookmarks(bookmarksData);
      setActivities(activitiesData as ActivityItem[]);
      
      // Calculate real-time completed projects count
      const regularCompleted = progressData.filter((p: any) => p.status === 'COMPLETED').length;
      const githubCompleted = githubProgressData.filter((p: any) => p.status === 'COMPLETED').length;
      setCompletedProjectsCount(regularCompleted + githubCompleted);

      // Fetch user XP from analytics dashboard
      const token = localStorage.getItem('accessToken');
      if (token) {
        const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setUserXP(dashboardData.user?.points || 0);
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(editForm);
      await refreshUser();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await userApi.uploadProfileImage(formData);
      await refreshUser();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  const stats = {
    projectsCompleted: completedProjectsCount,
    bookmarksCount: bookmarks.length,
    contributions: activities.length,
    xp: userXP,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-end gap-6 -mt-16">
            <div className="relative group">
              <div className="size-32 rounded-2xl bg-white p-1 shadow-xl border border-border">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center rounded-xl text-primary">
                    <User size={48} />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? <Activity className="animate-spin" /> : <Upload size={20} />}
                  <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                    {user.headline || 'Technical Professional'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                  <Link 
                    href="/settings"
                    className="p-2.5 bg-white border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <Settings size={20} />
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} /> {user.location || 'Remote'}
                </div>
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <Globe size={16} /> GitHub Profile
                  </a>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={16} /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} /> Joined February 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Completed', value: stats.projectsCompleted, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Bookmarks', value: stats.bookmarksCount, icon: BookmarkIcon, bg: 'bg-blue-50', color: 'text-blue-500' },
          { label: 'Platform XP', value: stats.xp, icon: Trophy, bg: 'bg-amber-50', color: 'text-amber-500' },
          { label: 'Global Rank', value: stats.projectsCompleted > 0 ? `#${Math.max(10 - stats.projectsCompleted, 1)}` : 'N/A', icon: Zap, bg: 'bg-violet-50', color: 'text-violet-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs / Content Area */}
      <div className="space-y-6">
        <div className="flex border-b border-border">
          {[
            { id: 'overview', label: 'Overview', icon: History },
            { id: 'bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
            { id: 'activity', label: 'Recent Activity', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Technical Profile</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {user.headline ? `${user.headline}. Primary focus on full-stack engineering and cloud-native solutions.` : 'No bio provided. Update your profile to share your expertise.'}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-6">Recent Achievements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Early Adopter</p>
                        <p className="text-xs text-muted-foreground">Joined in the first month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Project Hunter</p>
                        <p className="text-xs text-muted-foreground">First bookmark created</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                  <h4 className="font-bold text-foreground mb-4">Identity Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Account Tier</span>
                      <span className="font-bold">Standard</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Sessions</span>
                      <span className="font-bold">{activities.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'bookmarks' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark) => (
                  <GitHubProjectCard
                    key={bookmark.id}
                    project={(bookmark.githubProject || bookmark.project) as GitHubProjectType}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground italic">No projects saved to your bookmarks.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <div key={activity.id} className="flex gap-4 p-4 bg-white rounded-xl border border-border hover:shadow-md transition-shadow">
                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
                      <Activity size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-foreground">{activity.description}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        System event logged at local node.
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground italic">No recent activity found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-secondary/30">
              <h3 className="font-bold text-foreground">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-secondary rounded-full" aria-label="Close modal">
                <Shield size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full bg-secondary/40 border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full bg-secondary/40 border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="headline" className="text-xs font-bold text-muted-foreground uppercase">Professional Headline</label>
                <input
                  id="headline"
                  type="text"
                  className="w-full bg-secondary/40 border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editForm.headline}
                  onChange={(e) => setEditForm(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g. Full Stack Developer | React Expert"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase">Location</label>
                <input
                  id="location"
                  type="text"
                  className="w-full bg-secondary/40 border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="githubUrl" className="text-xs font-bold text-muted-foreground uppercase">GitHub URL</label>
                <input
                  id="githubUrl"
                  type="text"
                  className="w-full bg-secondary/40 border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-border rounded-lg font-semibold hover:bg-secondary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
