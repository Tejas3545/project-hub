'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Award,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  points: number;
  earnedAt?: string;
}

interface Progress {
  totalHours: number;
  completedProjects: number;
  currentStreak: number;
  points: number;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [userRes, allRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamification/achievements/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/gamification/achievements/all`)
      ]);
      if (userRes.ok && allRes.ok) {
        const userData = await userRes.json();
        const allData = await allRes.json();
        setAchievements(userData.achievements);
        setAllAchievements(allData.achievements);
        setProgress(userData.progress);
      }
    } catch (error) {
      console.error('Fetch achievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROJECT': return <Target size={20} />;
      case 'TIME': return <Clock size={20} />;
      case 'STREAK': return <Zap size={20} />;
      default: return <Award size={20} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Achievements</h1>
          <p className="text-muted-foreground mt-1">Track your technical milestones and platform recognition.</p>
        </div>
        <div className="flex items-center gap-6 bg-white px-6 py-4 rounded-xl border border-border shadow-sm">
          <div className="flex flex-col items-center px-4 border-r border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Points</span>
            <span className="text-2xl font-bold text-primary">{progress?.points || 0}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Rank</span>
            <span className="text-2xl font-bold text-foreground">#{(progress?.completedProjects || 0) > 0 ? Math.max(10 - (progress?.completedProjects || 0), 1) : 'N/A'}</span>
          </div>
        </div>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Completed', value: progress?.completedProjects || 0, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Total Hours', value: `${progress?.totalHours || 0}h`, icon: Clock, bg: 'bg-blue-50', color: 'text-blue-500' },
          { label: 'Current Streak', value: `${progress?.currentStreak || 0}d`, icon: Zap, bg: 'bg-amber-50', color: 'text-amber-500' },
          { label: 'Efficiency', value: '94%', icon: TrendingUp, bg: 'bg-violet-50', color: 'text-violet-500' }
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Unlocked Achievements */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" /> Unlocked Milestones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex items-start gap-4 hover:border-primary/30 transition-all group">
                  <div className="size-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{achievement.name}</h4>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase border border-amber-100">+{achievement.points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(achievement.earnedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-secondary/20 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground italic">Complete tasks to unlock your first achievement.</p>
              </div>
            )}
          </div>
        </div>

        {/* Locked / Future Achievements */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock size={20} className="text-muted-foreground" /> Next Challenges
          </h3>
          
          <div className="space-y-3">
            {allAchievements.filter(a => !achievements.some(ua => ua.id === a.id)).slice(0, 5).map((achievement) => (
              <div key={achievement.id} className="bg-white p-4 rounded-xl border border-border opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help relative overflow-hidden group">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{achievement.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{achievement.description}</p>
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 w-1/3"></div>
                </div>
                <div className="absolute top-2 right-2">
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <Activity size={20} className="text-primary" />
              <h4 className="text-sm font-bold text-foreground">Operational Status</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Platform status verified at {(85 + (progress?.completedProjects || 0)).toFixed(1)}%. Continue active engagement to increase node synchronization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lock({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
