'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/update-streak`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Update streak error:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!dashboardData) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Failed to load analytics data. Please try again.
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-px w-12 bg-primary"></span>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Analytics</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-8 uppercase">
          Analytics<br />
          <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
          Track your learning progress, time invested, and project completion across all domains.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Time Invested', val: `${dashboardData.user.totalTimeSpentHours}H`, label: 'Total hours tracked', icon: 'schedule', color: 'text-primary' },
          { title: 'Active Streak', val: `${dashboardData.user.currentStreak}D`, label: 'Consecutive days', icon: 'bolt', color: 'text-amber-500' },
          { title: 'Completed', val: dashboardData.projects.completed, label: 'Projects finished', icon: 'verified', color: 'text-emerald-500' },
          { title: 'Points Earned', val: dashboardData.user.points, label: 'Total experience', icon: 'military_tech', color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-3xl border border-border relative overflow-hidden group hover:border-border transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <span className="material-symbols-outlined text-8xl italic uppercase">{stat.icon}</span>
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full gap-8">
              <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined text-3xl ${stat.color} font-thin`}>{stat.icon}</span>
              </div>
              <div>
                <h4 className="text-5xl font-black text-foreground mb-2 uppercase tracking-tighter group-hover:text-primary transition-colors">{stat.val}</h4>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <p className="text-[9px] font-bold text-muted-foreground italic lowercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[40px] border border-border space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Project Progress</h3>
            <span className="material-symbols-outlined text-primary">target</span>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Completion Rate</span>
                <span className="text-4xl font-black text-primary">{dashboardData.projects.completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-1000"
                  style={{ width: `${dashboardData.projects.completionRate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-secondary/50 border border-border rounded-2xl">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Projects</p>
                <p className="text-3xl font-black text-foreground uppercase">{dashboardData.projects.total}</p>
              </div>
              <div className="p-6 bg-secondary/50 border border-border rounded-2xl">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">In Progress</p>
                <p className="text-3xl font-black text-amber-500 uppercase">{dashboardData.projects.inProgress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[40px] border border-border space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Your Level</h3>
            <span className="material-symbols-outlined text-emerald-500">verified</span>
          </div>

          <div className="space-y-10">
            <div className="flex items-center gap-8 p-8 bg-secondary/50 border border-border rounded-3xl group">
              <div className="size-20 rounded-full border-2 border-primary/30 flex items-center justify-center relative overflow-hidden group-hover:border-primary transition-all">
                <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
                <span className="text-2xl font-black text-foreground z-10">{dashboardData.user.level}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Level</p>
                <p className="text-2xl font-black text-foreground uppercase tracking-tighter">Level {Math.floor(dashboardData.user.level / 10) + 1}</p>
                <p className="text-[9px] font-bold text-primary italic lowercase tracking-widest mt-1">{dashboardData.user.points} XP earned</p>
              </div>
            </div>

            <div className="flex items-center gap-8 p-8 bg-secondary/50 border border-border rounded-3xl">
              <div className="size-20 rounded-full border-2 border-orange-500/30 flex items-center justify-center text-orange-400">
                <span className="material-symbols-outlined text-4xl">bolt</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Best Streak</p>
                <p className="text-2xl font-black text-foreground uppercase tracking-tighter">Streak: {dashboardData.user.longestStreak} Days</p>
                <p className="text-[9px] font-bold text-orange-400 italic lowercase tracking-widest mt-1">{dashboardData.user.currentStreak} Days current streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Browse Projects', subText: 'Find new projects to work on', href: '/projects', icon: 'search' },
          { label: 'Achievements', subText: 'View your earned badges', href: '/achievements', icon: 'military_tech' },
          { label: 'Learning Paths', subText: 'Explore curated paths', href: '/learning-paths', icon: 'auto_awesome' }
        ].map((link, i) => (
          <Link key={i} href={link.href} className="group">
            <div className="bg-white p-8 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-center h-full flex flex-col items-center justify-center gap-4">
              <span className="material-symbols-outlined text-3xl text-muted-foreground group-hover:text-primary transition-colors">{link.icon}</span>
              <div>
                <h4 className="font-black text-foreground uppercase text-[10px] tracking-widest group-hover:text-primary transition-colors">
                  {link.label}
                </h4>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  {link.subText}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
