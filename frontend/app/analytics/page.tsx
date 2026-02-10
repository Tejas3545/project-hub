'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, Clock, Trophy, Target, TrendingUp, Calendar,
  Flame, Award
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  user: {
    totalTimeSpent: number;
    totalTimeSpentHours: number;
    weeklyTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
    points: number;
    level: number;
  };
  projects: {
    total: number;
    inProgress: number;
    completed: number;
    notStarted: number;
    completionRate: number;
  };
  achievements: {
    total: number;
  };
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboard();
      updateStreak();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/update-streak`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Update streak error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-parchment-light dark:bg-ink-DEFAULT py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-ink-DEFAULT dark:text-parchment-light mb-4">
            Login Required
          </h2>
          <Link href="/login" className="text-terracotta-DEFAULT hover:underline">
            Please login to view your analytics
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-light dark:bg-ink-DEFAULT py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-DEFAULT mx-auto"></div>
          <p className="mt-4 text-slate-warm dark:text-stone-text">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center py-20">Failed to load dashboard data</div>;
  }

  const statCards = [
    {
      title: 'Total Hours Logged',
      value: dashboardData.user.totalTimeSpentHours,
      icon: Clock,
      color: 'text-terracotta-DEFAULT',
      bgColor: 'bg-terracotta-muted dark:bg-terracotta-DEFAULT/10'
    },
    {
      title: 'Current Streak',
      value: `${dashboardData.user.currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Projects Completed',
      value: dashboardData.projects.completed,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Experience Points',
      value: dashboardData.user.points,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-parchment-light dark:bg-ink-DEFAULT py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-ink-DEFAULT dark:text-parchment-light mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-warm dark:text-stone-text">
            Track your progress and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className={`p-6 ${stat.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-12 h-12 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Project Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Project Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Projects</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData.projects.total}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                  <span className="font-semibold text-terracotta-DEFAULT">
                    {dashboardData.projects.inProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-terracotta-DEFAULT h-2 rounded-full dynamic-width"
                    {...{ style: { '--bar-width': `${(dashboardData.projects.inProgress / dashboardData.projects.total) * 100}%` } as React.CSSProperties }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-semibold text-green-600">
                    {dashboardData.projects.completed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full dynamic-width"
                    {...{ style: { '--bar-width': `${dashboardData.projects.completionRate}%` } as React.CSSProperties }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {dashboardData.projects.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Achievements & Streaks
            </h3>
            <div className="space-y-6">
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                <Flame className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.user.currentStreak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Longest: {dashboardData.user.longestStreak} days
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.achievements.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Achievements Unlocked
                </div>
                <Link 
                  href="/achievements" 
                  className="text-xs text-purple-600 hover:underline mt-2 inline-block"
                >
                  View All →
                </Link>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  Level {dashboardData.user.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dashboardData.user.points} XP
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/projects">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Browse Projects
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find new projects to work on
              </p>
            </Card>
          </Link>

          <Link href="/achievements">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                View Achievements
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See all your unlocked badges
              </p>
            </Card>
          </Link>

          <Link href="/learning-paths">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Learning Paths
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get personalized recommendations
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
