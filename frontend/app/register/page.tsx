'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to login after 5 seconds
        const timer = setTimeout(() => {
            router.push('/login');
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [router]);
    
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-md w-full mx-4">
                <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Registration Disabled
                    </h1>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Public registration is currently disabled. To access this platform, please contact the administrator to receive your login credentials.
                    </p>
                    
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300"
                        >
                            Go to Login
                        </Link>
                        
                        <Link
                            href="/"
                            className="block w-full px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300"
                        >
                            Back to Home
                        </Link>
                    </div>
                    
                    <p className="mt-6 text-sm text-gray-500">
                        Redirecting to login in 5 seconds...
                    </p>
                </div>
            </div>
        </div>
    );
}
