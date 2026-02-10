'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Trophy, Lock, Clock, Target, Flame, Users, Star } from 'lucide-react';
import Link from 'next/link';

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
      if (!token) return;

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
      case 'TIME_TRACKING': return <Clock className="w-6 h-6" />;
      case 'PROJECTS': return <Target className="w-6 h-6" />;
      case 'STREAK': return <Flame className="w-6 h-6" />;
      case 'SOCIAL': return <Users className="w-6 h-6" />;
      case 'LEARNING': return <Star className="w-6 h-6" />;
      default: return <Trophy className="w-6 h-6" />;
    }
  };

  const achievementsByCategory = allAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) acc[achievement.category] = [];
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as {[key: string]: Achievement[]});

  const isEarned = (achievementId: string) => 
    achievements.some(a => a.id === achievementId);

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl font-bold text-gradient-cyan-blue mb-4">
            Login Required
          </h2>
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
            Please login to view your achievements
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-accent rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-purple-accent rounded-full blur-3xl opacity-40"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gradient-blue-purple mb-2 font-bold">
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Unlock achievements by completing projects and reaching milestones
          </p>
        </div>

        {/* Progress Summary */}
        {progress && (
          <Card className="p-6 mb-8 bg-card border border-border/30 rounded-xl relative overflow-hidden hover-lift">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-blue-purple opacity-10 rounded-full blur-3xl"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{achievements.length}</div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-500">{progress.totalHours}h</div>
                <div className="text-sm text-muted-foreground">Logged</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{progress.completedProjects}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{progress.points}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
            </div>
          </Card>
        )}

        {/* Achievements by Category */}
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              {getCategoryIcon(category)}
              {category.replace('_', ' ')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map(achievement => {
                const earned = isEarned(achievement.id);
                const earnedData = achievements.find(a => a.id === achievement.id);
                
                return (
                  <Card
                    key={achievement.id}
                    className={`p-6 rounded-xl border transition-all hover-lift ${
                      earned
                        ? 'bg-success-accent border-green-500/30 shadow-md'
                        : 'bg-card border-border/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      {earned ? (
                        <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {achievement.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary font-semibold">
                        {achievement.points} XP
                      </span>
                      {earnedData && (
                        <span className="text-muted-foreground text-xs">
                          {new Date(earnedData.earnedAt!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {allAchievements.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No achievements available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
