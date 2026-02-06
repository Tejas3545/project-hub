'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/neon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const { user, isAdmin } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            
            // Reload page to refresh user data
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
        });
        setIsEditing(false);
        setMessage(null);
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
                            My Profile
                        </h1>
                        <p className="text-text-secondary">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    <div className="glass-card p-8">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                                {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">
                                    {user?.firstName && user?.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : 'User'}
                                </h2>
                                <p className="text-text-secondary">{user?.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                                        {isAdmin ? 'Administrator' : 'Student'}
                                    </span>
                                    {user?.isVerified && (
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-text-primary">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-2">
                                        First Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="bg-[#0F0F0F] border-white/10 text-white"
                                            placeholder="Enter first name"
                                        />
                                    ) : (
                                        <div className="text-text-primary p-3 bg-dark-card rounded-lg border border-dark-lighter">
                                            {user?.firstName || 'Not set'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-2">
                                        Last Name
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="bg-[#0F0F0F] border-white/10 text-white"
                                            placeholder="Enter last name"
                                        />
                                    ) : (
                                        <div className="text-text-primary p-3 bg-dark-card rounded-lg border border-dark-lighter">
                                            {user?.lastName || 'Not set'}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">
                                        Email Address
                                    </label>
                                    <div className="text-text-primary p-3 bg-dark-card rounded-lg border border-dark-lighter opacity-70">
                                        {user?.email}
                                    </div>
                                    <p className="text-xs text-text-muted mt-1">
                                        Email cannot be changed contact support for assistance.
                                    </p>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="pt-6 mt-6 border-t border-white/5">
                                <div className="flex gap-3">
                                    {isEditing ? (
                                        <>
                                            <Button 
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="bg-indigo-600 hover:bg-indigo-500"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button 
                                                onClick={handleCancel}
                                                variant="outline"
                                                disabled={isSaving}
                                                className="border-white/10 text-white hover:bg-white/5"
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button 
                                            onClick={() => setIsEditing(true)}
                                            className="bg-indigo-600 hover:bg-indigo-500"
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
