'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi } from '@/lib/api';

interface LeaderboardUser {
    rank: number;
    id: string;
    name: string;
    image: string | null;
    points: number;
    level: number;
    projectsCompleted: number;
    totalTimeSpent: number;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await analyticsApi.getLeaderboard();
                setUsers(data);
            } catch (error) {
                console.error('Failed to load leaderboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pill-badge"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Top Performers
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
                    >
                        Global <span className="text-gradient">Leaderboard</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-lg mx-auto"
                    >
                        Recognizing the most dedicated developers in our community based on points, projects completed, and engagement.
                    </motion.p>
                </div>

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-border rounded-xl overflow-hidden"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-secondary/50">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5 md:col-span-6">Developer</div>
                        <div className="col-span-2 text-center hidden md:block">Projects</div>
                        <div className="col-span-3 md:col-span-3 text-right">Points</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-border">
                        {users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/50 transition-colors group ${index < 3 ? 'bg-primary/5' : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className="col-span-1 flex justify-center">
                                    <div className={`
                    w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                    ${index === 0 ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                                            index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                index === 2 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                    'text-muted-foreground bg-secondary border border-border'}
                  `}>
                                        {user.rank}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="col-span-5 md:col-span-6 flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        {index < 3 && (
                                            <div className="absolute -top-1 -right-1">
                                                <span className="material-symbols-outlined text-[14px] text-yellow-400">
                                                    verified
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                            {user.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Level {user.level}
                                        </p>
                                    </div>
                                </div>

                                {/* Projects */}
                                <div className="col-span-2 hidden md:flex justify-center">
                                    <span className="px-3 py-1 rounded-full bg-secondary border border-border text-xs font-bold text-foreground">
                                        {user.projectsCompleted}
                                    </span>
                                </div>

                                {/* Points */}
                                <div className="col-span-3 md:col-span-3 text-right pr-4">
                                    <div className="font-bold text-foreground text-lg tabular-nums tracking-tight">
                                        {user.points.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Points</div>
                                </div>
                            </motion.div>
                        ))}

                        {users.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground">
                                <span className="material-symbols-outlined text-4xl mb-4 opacity-50">leaderboard</span>
                                <p className="font-medium">No active users found yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
