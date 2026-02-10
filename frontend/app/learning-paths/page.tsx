'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Route, Clock, Target, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  domains: string[];
  projectIds: string[];
  estimatedTime: number;
  skills: string[];
}

interface Recommendation {
  completedProjects: number;
  recommendedDifficulty: string;
  topDomain: string;
  topSkills: string[];
}

export default function LearningPathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [recommendations, setRecommendations] = useState<LearningPath[]>([]);
  const [insights, setInsights] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchPaths = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-paths`);
      if (res.ok) {
        const data = await res.json();
        setPaths(data.paths);
      }
    } catch (error) {
      console.error('Fetch paths error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning-paths/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations);
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case 'EASY': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'HARD': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 relative">
      {/* Decorative gradient backgrounds */}
      <div className="fixed top-20 right-10 w-96 h-96 gradient-blue-purple opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-80 h-80 gradient-purple-cyan opacity-5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-cyan-blue mb-2">
            Learning Paths
          </h1>
          <p className="text-muted-foreground">
            Structured learning journeys to master new skills
          </p>
        </div>

        {/* Personalized Recommendations */}
        {user && recommendations.length > 0 && insights && (
          <div className="mb-12">
            <Card className="p-6 gradient-blue-purple text-white mb-6 relative overflow-hidden hover-lift rounded-xl border-border/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 relative">
                <TrendingUp className="w-6 h-6" />
                Recommended For You
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{insights.completedProjects}</div>
                  <div className="opacity-90">Projects Completed</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{insights.recommendedDifficulty}</div>
                  <div className="opacity-90">Your Level</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{insights.topSkills.length}</div>
                  <div className="opacity-90">Skills Mastered</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{recommendations.length}</div>
                  <div className="opacity-90">Recommended Paths</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(path => (
                <Card key={path.id} className="p-6 hover-lift rounded-xl border border-primary/30 bg-card relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="mb-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                      <Route className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {path.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {path.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4 relative">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      {path.projectIds.length} Projects
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      ~{path.estimatedTime} hours
                    </div>
                  </div>

                  <div className="mb-4 relative">
                    <div className="text-xs text-muted-foreground mb-2">Skills you'll learn:</div>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-accent text-primary text-xs rounded border border-primary/20">
                          {skill}
                        </span>
                      ))}
                      {path.skills.length > 4 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          +{path.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button className="w-full gradient-blue-purple text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/20 relative">
                    Start Path
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Learning Paths */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            All Learning Paths
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(path => (
              <Card key={path.id} className="p-6 hover-lift rounded-xl border border-border/30 bg-card">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                    <Route className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {path.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {path.description}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    {path.projectIds.length} Projects
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    ~{path.estimatedTime} hours
                  </div>
                </div>

                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md">
                  View Path
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>

          {paths.length === 0 && (
            <div className="text-center py-20">
              <Route className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No learning paths available yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
