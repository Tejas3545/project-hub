'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import WorkstationLayout from '@/components/layouts/WorkstationLayout';

export default function RootWorkstationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <WorkstationLayout>
                {children}
            </WorkstationLayout>
        </ProtectedRoute>
    );
}
